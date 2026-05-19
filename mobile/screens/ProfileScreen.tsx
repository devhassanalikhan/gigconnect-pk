// KaamGraph / Mobile / mobile/screens/ProfileScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, StatusBar, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';

export default function ProfileScreen({ navigation }: any) {
  const { colors, theme, toggleTheme, userRole, toggleUserRole, language, toggleLanguage, t, userProfile, setUserProfile } = useTheme();

  const [nameInput, setNameInput] = useState(userProfile.name);
  const [phoneInput, setPhoneInput] = useState(userProfile.phone);
  const [emailInput, setEmailInput] = useState(userProfile.email);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setUserProfile((prev) => ({
      ...prev,
      name: nameInput,
      phone: phoneInput,
      email: emailInput,
    }));
    setIsEditing(false);
    Alert.alert('Success', 'Profile saved successfully!');
  };

  const handleLogout = () => {
    setUserProfile((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={[styles.content, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60 }]}
    >
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />

      {/* Header Info */}
      <View style={[styles.headerCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ 
              uri: userRole === 'client' 
                ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' 
                : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80' 
            }}
            style={[styles.avatar, { borderColor: userRole === 'client' ? colors.primary : colors.success }]}
          />
          <View style={[styles.badgeVerified, { backgroundColor: colors.background }]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          </View>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{userRole === 'client' ? userProfile.name : 'Arsalan AC & Electrician'}</Text>
        <Text style={[styles.userRole, { color: colors.textMuted }]}>{userRole === 'client' ? t.premiumClient : t.topRatedProvider}</Text>
        
        {/* CNIC Verification Status */}
        <View style={[styles.cnicStatus, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
          <Ionicons name="shield-checkmark" size={14} color={colors.warning} />
          <Text style={[styles.cnicText, { color: colors.warning }]}>{userRole === 'client' ? t.verifiedBadgeClient : t.verifiedBadgeWorker}</Text>
        </View>
      </View>

      {/* Dynamic Role Switcher Card */}
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t.accountModeSelector}</Text>
      <View style={[styles.roleSwitchCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <View style={styles.roleSwitchRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[styles.roleSwitchTitle, { color: colors.text }]}>{userRole === 'client' ? t.clientShellActive : t.workerShellActive}</Text>
            <Text style={[styles.roleSwitchDesc, { color: colors.textMuted }]}>{userRole === 'client' ? t.clientShellDesc : t.workerShellDesc}</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.switchActionBtn, 
              { backgroundColor: userRole === 'client' ? colors.primary : colors.success }
            ]} 
            onPress={toggleUserRole}
            activeOpacity={0.8}
          >
            <Text style={styles.switchActionText}>{userRole === 'client' ? t.toWorker : t.toClient}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Details Edit Card */}
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Profile Settings</Text>
      <View style={[styles.menuContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border, padding: 16 }]}>
        {isEditing ? (
          <View>
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Full Name</Text>
            <TextInput
              style={[styles.profileInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={nameInput}
              onChangeText={setNameInput}
            />
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Phone</Text>
            <TextInput
              style={[styles.profileInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={phoneInput}
              onChangeText={setPhoneInput}
            />
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Email</Text>
            <TextInput
              style={[styles.profileInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={emailInput}
              onChangeText={setEmailInput}
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setIsEditing(false)}>
                <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Name:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{userProfile.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Phone:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{userProfile.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Email:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{userProfile.email}</Text>
            </View>
            <TouchableOpacity style={[styles.editModeBtn, { borderColor: colors.border }]} onPress={() => setIsEditing(true)}>
              <Text style={[styles.editModeBtnText, { color: colors.text }]}>Edit Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Appearance Settings */}
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t.appearanceMode}</Text>
      <View style={[styles.menuContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={toggleTheme} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <Ionicons 
              name={theme === 'dark' ? 'moon' : 'sunny'} 
              size={20} 
              color={colors.primary} 
            />
            <Text style={[styles.menuText, { color: colors.text }]}>{theme === 'dark' ? t.darkActive : t.lightActive}</Text>
          </View>
          <View style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            backgroundColor: theme === 'dark' ? colors.primary : colors.border,
            justifyContent: 'center',
            paddingHorizontal: 2,
            alignItems: theme === 'dark' ? 'flex-end' : 'flex-start',
          }}>
            <View style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#ffffff',
            }} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Settings Options Group */}
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t.accountOptions}</Text>
      <View style={[styles.menuContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <View style={styles.menuLeft}>
            <Ionicons name="card-outline" size={20} color={colors.primary} />
            <Text style={[styles.menuText, { color: colors.text }]}>{userRole === 'client' ? t.paymentMethods : t.payoutMethods}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <View style={styles.menuLeft}>
            <Ionicons name="shield-outline" size={20} color={colors.warning} />
            <Text style={[styles.menuText, { color: colors.text }]}>{t.cnicVerification}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <View style={styles.menuLeft}>
            <Ionicons name="notifications-outline" size={20} color={colors.success} />
            <Text style={[styles.menuText, { color: colors.text }]}>{t.notifications}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={toggleLanguage} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <Ionicons name="language-outline" size={20} color="#a855f7" />
            <Text style={[styles.menuText, { color: colors.text }]}>{t.languagePref}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]} onPress={handleLogout}>
        <Text style={[styles.logoutText, { color: colors.danger }]}>{t.logOut}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
  },
  badgeVerified: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderRadius: 10,
    padding: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    marginBottom: 10,
  },
  cnicStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  cnicText: {
    fontSize: 11,
    marginLeft: 6,
    fontWeight: '600',
    color: '#fbbf24',
  },
  roleSwitchCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  roleSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleSwitchTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleSwitchDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  switchActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
  },
  statVal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuContainer: {
    borderRadius: 16,
    paddingVertical: 6,
    marginBottom: 20,
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 14,
    marginLeft: 12,
  },
  logoutButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  profileInput: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 14,
  },
  editActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  saveBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cancelBtnText: {
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    width: 60,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  infoValue: {
    color: '#fff',
  },
  editModeBtn: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  editModeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
