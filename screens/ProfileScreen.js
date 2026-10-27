import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView as RNSafeAreaView,
  Switch,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatsManager } from '../utils/statsManager';
import { getRecentQuizzes } from '../utils/recentQuizzes';

export default function ProfileScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [recentQuizzes, setRecentQuizzes] = useState([]);

  // Load data when component mounts
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userStats, userProfile, history] = await Promise.all([
        StatsManager.getStats(),
        StatsManager.getProfile(),
        StatsManager.getQuizHistory(),
      ]);
      setStats(userStats);
      setProfile(userProfile);
      setRecentQuizzes(getRecentQuizzes(history));
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Hata', 'Kullanıcı verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const updateProfileSetting = async (key, value) => {
    try {
      const updatedProfile = await StatsManager.updateProfile({ [key]: value });
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Hata', 'Ayar güncellenemedi');
    }
  };

  const handleNameChange = async () => {
    if (!newUserName.trim()) {
      Alert.alert('Hata', 'Lütfen geçerli bir isim girin');
      return;
    }

    try {
      await updateProfileSetting('userName', newUserName.trim());
      setShowNameModal(false);
      setNewUserName('');
      Alert.alert('Başarılı', 'İsminiz güncellendi');
    } catch (error) {
      Alert.alert('Hata', 'İsim güncellenemedi');
    }
  };

  const resetAllData = () => {
    Alert.alert(
      'Tüm Verileri Sıfırla',
      'Bu işlem tüm istatistiklerinizi ve ayarlarınızı siler. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            try {
              await StatsManager.resetAllData();
              await loadUserData();
              Alert.alert('Başarılı', 'Tüm veriler sıfırlandı');
            } catch (error) {
              Alert.alert('Hata', 'Veriler sıfırlanamadı');
            }
          },
        },
      ]
    );
  };

  // Show loading spinner while data loads
  if (loading || !stats || !profile) {
    return (
      <RNSafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.background}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        </LinearGradient>
      </RNSafeAreaView>
    );
  }

  // Calculate derived stats
  const accuracy = stats.totalQuestions > 0
    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
    : 0;

  const averageTime = stats.totalQuizzes > 0
    ? Math.round(stats.totalTime / stats.totalQuizzes)
    : 0;

  const bestCategory = StatsManager.getBestCategory(stats.categoryStats);
  const userLevel = StatsManager.calculateLevel(stats.totalQuizzes);

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );
  const WeeklyChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Haftalık Performans</Text>
      <View style={styles.chart}>
        {stats.weeklyData.length > 0 ? stats.weeklyData.map((item, index) => (
          <View key={index} style={styles.chartBar}>
            <View
              style={[
                styles.bar,
                {
                  height: item.count > 0 ? Math.max(item.score, 10) * 1.2 : 12,
                  backgroundColor: item.score >= 80 ? '#48bb78' : item.score >= 60 ? '#ed8936' : '#f56565',
                  opacity: item.count > 0 ? 1 : 0.3,
                },
              ]}
            />
            <Text style={styles.chartLabel}>{item.day}</Text>
            <Text style={styles.chartCount}>{item.count}</Text>
          </View>
        )) : (
          <Text style={styles.noDataText}>Henüz veri bulunmuyor</Text>
        )}
      </View>
    </View>
  );

  return (
    <RNSafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>          {/* Profile Info */}
          <View style={styles.profileCard}>
            <Text style={styles.avatar}>👤</Text>
            <Text style={styles.userName}>{profile.userName}</Text>
            <Text style={styles.userLevel}>Quiz Seviyesi: {userLevel}</Text>
            <Text style={styles.memberSince}>
              Üye: {new Date(profile.joinDate).toLocaleDateString('tr-TR')}
            </Text>
          </View>

          {/* Statistics */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>İstatistikler</Text>

            <StatCard
              title="Toplam Quiz"
              value={stats.totalQuizzes}
              icon="📊"
              color="#4299e1"
            />

            <StatCard
              title="Doğru Cevap"
              value={`${stats.correctAnswers}/${stats.totalQuestions}`}
              icon="✅"
              color="#48bb78"
            />

            <StatCard
              title="Doğruluk Oranı"
              value={`%${accuracy}`}
              icon="🎯"
              color="#9f7aea"
            />

            <StatCard
              title="En İyi Kategori"
              value={bestCategory}
              icon="🏆"
              color="#ed8936"
            />

            <StatCard
              title="Günlük Seri"
              value={`${stats.currentStreak} gün`}
              icon="🔥"
              color="#f56565"
            />

            <StatCard
              title="En Uzun Seri"
              value={`${stats.longestStreak} gün`}
              icon="🏅"
              color="#38b2ac"
            />

            <StatCard
              title="Ortalama Süre"
              value={`${averageTime}s`}
              icon="⏱️"
              color="#805ad5"
            />

            <StatCard
              title="En İyi Skor"
              value={`%${stats.bestScore}`}
              icon="⭐"
              color="#d69e2e"
            />
          </View>

          {/* Weekly Chart */}
          <WeeklyChart />

          {/* Recent quiz history (read-only) */}
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Son Quizler</Text>
            {recentQuizzes.length === 0 ? (
              <Text style={styles.recentEmpty}>Henüz tamamlanmış quiz yok.</Text>
            ) : recentQuizzes.map((quiz, index) => (
              <View key={`${'${quiz.completedAt}'}-${'${index}'}`} style={styles.recentRow}>
                <Text style={styles.recentCategory}>{quiz.category}</Text>
                <Text style={styles.recentMeta}>
                  %{quiz.score} · {new Date(quiz.completedAt).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            ))}
          </View>

          {/* Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Ayarlar</Text>
              <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🔊</Text>
                <Text style={styles.settingText}>Ses Efektleri</Text>
              </View>
              <Switch
                value={profile.soundEnabled}
                onValueChange={(value) => updateProfileSetting('soundEnabled', value)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={profile.soundEnabled ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🌙</Text>
                <Text style={styles.settingText}>Karanlık Mod</Text>
              </View>
              <Switch
                value={profile.darkMode}
                onValueChange={(value) => updateProfileSetting('darkMode', value)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={profile.darkMode ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => {
                setNewUserName(profile.userName);
                setShowNameModal(true);
              }}
            >
              <Text style={styles.settingIcon}>📝</Text>
              <Text style={styles.settingText}>Adı Değiştir</Text>
              <Text style={styles.settingArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingButton}
              onPress={() => Alert.alert(
                'Quizify Hakkında',
                'Quizify v1.0\n\nBilgi yarışması uygulaması ile öğrenmeyi eğlenceli hale getirin!\n\nGeliştirici: GitHub Copilot',
                [{ text: 'Tamam' }]
              )}
            >
              <Text style={styles.settingIcon}>ℹ️</Text>
              <Text style={styles.settingText}>Uygulama Hakkında</Text>
              <Text style={styles.settingArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingButton, styles.resetButton]}
              onPress={resetAllData}
            >
              <Text style={styles.settingIcon}>🗑️</Text>
              <Text style={[styles.settingText, styles.resetText]}>Verileri Sıfırla</Text>
              <Text style={styles.settingArrow}>→</Text>
            </TouchableOpacity>          </View>
        </ScrollView>

        {/* Name Change Modal */}
        <Modal
          visible={showNameModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowNameModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>İsminizi Değiştirin</Text>
              <TextInput
                style={styles.nameInput}
                value={newUserName}
                onChangeText={setNewUserName}
                placeholder="Yeni isminizi girin"
                maxLength={20}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowNameModal(false);
                    setNewUserName('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleNameChange}
                >
                  <Text style={styles.confirmButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </RNSafeAreaView>
  );
}

const styles = StyleSheet.create({
  recentSection: {
    backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 20,
  },
  recentTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginBottom: 10 },
  recentEmpty: { color: '#718096', fontSize: 14 },
  recentRow: {
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  recentCategory: { fontSize: 16, color: '#2d3748', fontWeight: '600' },
  recentMeta: { fontSize: 13, color: '#718096', marginTop: 3 },
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  avatar: {
    fontSize: 60,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 5,
  },  userLevel: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 5,
  },
  memberSince: {
    fontSize: 14,
    color: '#a0aec0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  noDataText: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 14,
    fontStyle: 'italic',
  },
  chartCount: {
    fontSize: 10,
    color: '#a0aec0',
    marginTop: 2,
  },
  resetButton: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 10,
    paddingTop: 15,
  },
  resetText: {
    color: '#e53e3e',
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  statTitle: {
    fontSize: 14,
    color: '#718096',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    height: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    backgroundColor: '#48bb78',
    borderRadius: 10,
    marginBottom: 5,
  },
  chartLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
  },
  chartCount: {
    fontSize: 10,
    color: '#a0aec0',
  },
  noDataText: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 14,
    fontStyle: 'italic',
  },
  settingsSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  resetButton: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    color: '#2d3748',
    flex: 1,
  },
  resetText: {
    color: '#e53e3e',
  },
  settingArrow: {
    fontSize: 16,
    color: '#718096',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 20,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  confirmButton: {
    backgroundColor: '#4299e1',
  },
  cancelButtonText: {
    color: '#718096',
    textAlign: 'center',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});
