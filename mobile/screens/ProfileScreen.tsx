import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="light" />

      {/* Header Info */}
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }}
            style={styles.avatar}
          />
          <View style={styles.badgeVerified}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          </View>
        </View>
        <Text style={styles.userName}>Hassan Ali Khan</Text>
        <Text style={styles.userRole}>Premium Client • Islamabad</Text>
        
        {/* CNIC Verification Status */}
        <View style={styles.cnicStatus}>
          <Ionicons name="shield-checkmark" size={14} color="#f59e0b" />
          <Text style={styles.cnicText}>NADRA CNIC Verified (Tasdeeq AI)</Text>
        </View>
      </View>

      {/* KPI Stats Grid */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>12,500</Text>
          <Text style={styles.statLabel}>PKR In Escrow</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>24</Text>
          <Text style={styles.statLabel}>Completed Gigs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>4.9</Text>
          <Text style={styles.statLabel}>Rating (⭐)</Text>
        </View>
      </View>

      {/* Settings Options Group */}
      <Text style={styles.sectionTitle}>Account Options</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="card-outline" size={20} color="#6366f1" />
            <Text style={styles.menuText}>Payment Methods & Wallet</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="shield-outline" size={20} color="#f59e0b" />
            <Text style={styles.menuText}>CNIC & Police Verification</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="notifications-outline" size={20} color="#10b981" />
            <Text style={styles.menuText}>Notification Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="language-outline" size={20} color="#a855f7" />
            <Text style={styles.menuText}>Language Preferences (Urdu/Eng)</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <Text style={styles.sectionTitle}>Support & Legal</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#06b6d4" />
            <Text style={styles.menuText}>24/7 Live Support Helpline</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="document-text-outline" size={20} color="#e11d48" />
            <Text style={styles.menuText}>Terms of Service & Escrow Rules</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#16161a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#262629',
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
    borderColor: '#6366f1',
  },
  badgeVerified: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#0f0f0f',
    borderRadius: 10,
    padding: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 10,
  },
  cnicStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
  },
  cnicText: {
    fontSize: 11,
    color: '#f59e0b',
    marginLeft: 6,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#16161a',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#262629',
  },
  statVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuContainer: {
    backgroundColor: '#16161a',
    borderRadius: 16,
    paddingVertical: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#262629',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262629',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
  },
  logoutText: {
    color: '#e11d48',
    fontSize: 14,
    fontWeight: '600',
  },
});
