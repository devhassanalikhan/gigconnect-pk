import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';

export default function ProfileScreen() {
  const { colors, theme, toggleTheme, userRole, toggleUserRole } = useTheme();

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
        <Text style={[styles.userName, { color: colors.text }]}>{userRole === 'client' ? 'Hassan Ali Khan' : 'Arsalan AC & Electrician'}</Text>
        <Text style={[styles.userRole, { color: colors.textMuted }]}>{userRole === 'client' ? 'Premium Client • Islamabad' : 'Top Rated Provider • Sector G-13'}</Text>
        
        {/* CNIC Verification Status */}
        <View style={[styles.cnicStatus, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
          <Ionicons name="shield-checkmark" size={14} color={colors.warning} />
          <Text style={[styles.cnicText, { color: colors.warning }]}>{userRole === 'client' ? 'NADRA CNIC Verified (Tasdeeq AI)' : 'NADRA & Police Clearance Approved'}</Text>
        </View>
      </View>

      {/* Dynamic Role Switcher Card */}
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Account Mode Selector</Text>
      <View style={[styles.roleSwitchCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <View style={styles.roleSwitchRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[styles.roleSwitchTitle, { color: colors.text }]}>{userRole === 'client' ? 'Client Shell Active' : 'Worker Shell Active'}</Text>
            <Text style={[styles.roleSwitchDesc, { color: colors.textMuted }]}>{userRole === 'client' ? 'Hire nearby providers, auto-negotiate, and lock secure escrows.' : 'Receive job leads, auto-bid in Roman Urdu, and track earnings wallet.'}</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.switchActionBtn, 
              { backgroundColor: userRole === 'client' ? colors.primary : colors.success }
            ]} 
            onPress={toggleUserRole}
            activeOpacity={0.8}
          >
            <Text style={styles.switchActionText}>{userRole === 'client' ? 'To Worker' : 'To Client'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KPI Stats Grid - Adapts Dynamically */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.statVal, { color: userRole === 'client' ? colors.primary : colors.success }]}>{userRole === 'client' ? '12,500' : '48,600'}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{userRole === 'client' ? 'PKR In Escrow' : 'PKR Earned (Month)'}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.statVal, { color: userRole === 'client' ? colors.primary : colors.success }]}>{userRole === 'client' ? '24' : '68'}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{userRole === 'client' ? 'Completed Gigs' : 'Completed Gigs'}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.statVal, { color: userRole === 'client' ? colors.primary : colors.success }]}>{userRole === 'client' ? '4.9' : '4.95'}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{userRole === 'client' ? 'Rating (⭐)' : 'Rating (⭐)'}</Text>
        </View>
      </View>

      {/* Theme Settings Switching option */}
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance Mode</Text>
      <View style={[styles.menuContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={toggleTheme} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <Ionicons 
              name={theme === 'dark' ? 'moon' : 'sunny'} 
              size={20} 
              color={colors.primary} 
            />
            <Text style={[styles.menuText, { color: colors.text }]}>{theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}</Text>
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
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Account Options</Text>
      <View style={[styles.menuContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <View style={styles.menuLeft}>
            <Ionicons name="card-outline" size={20} color={colors.primary} />
            <Text style={[styles.menuText, { color: colors.text }]}>{userRole === 'client' ? 'Payment Methods & Wallet' : 'Payout Methods & Bank Details'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <View style={styles.menuLeft}>
            <Ionicons name="shield-outline" size={20} color={colors.warning} />
            <Text style={[styles.menuText, { color: colors.text }]}>CNIC & Police Verification</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <View style={styles.menuLeft}>
            <Ionicons name="notifications-outline" size={20} color={colors.success} />
            <Text style={[styles.menuText, { color: colors.text }]}>Notification Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
          <View style={styles.menuLeft}>
            <Ionicons name="language-outline" size={20} color="#a855f7" />
            <Text style={[styles.menuText, { color: colors.text }]}>Language Preferences (Urdu/Eng)</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Support & Legal</Text>
      <View style={[styles.menuContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <View style={styles.menuLeft}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#06b6d4" />
            <Text style={[styles.menuText, { color: colors.text }]}>24/7 Live Support Helpline</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
          <View style={styles.menuLeft}>
            <Ionicons name="document-text-outline" size={20} color={colors.danger} />
            <Text style={[styles.menuText, { color: colors.text }]}>Terms of Service & Escrow Rules</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
        <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out Account</Text>
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
});
