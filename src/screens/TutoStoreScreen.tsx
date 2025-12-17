import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface TutoStoreScreenProps {
  navigation: any;
}

interface StoreItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tokenPrice: number;
  category: 'digital' | 'physical' | 'experience';
  isAvailable: boolean;
  stock?: number;
}

export const TutoStoreScreen: React.FC<TutoStoreScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background.primary,
    },
    backButton: {
      padding: spacing.sm,
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    tokenBalance: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    tokenBalanceText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: '#4CAF50',
    },
    historyButton: {
      padding: spacing.sm,
    },
    categoryTabs: {
      backgroundColor: colors.background.secondary,
      paddingVertical: 8,
      paddingBottom: 12,
      height: 60,
    },
    categoryTabsContent: {
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    categoryTab: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 16,
      backgroundColor: colors.background.primary,
      minWidth: 60,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeCategoryTab: {
      backgroundColor: colors.primary,
    },
    categoryTabText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
    activeCategoryTabText: {
      color: colors.background.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    content: {
      flex: 1,
    },
    itemsContainer: {
      padding: spacing.lg,
    },
    storeItem: {
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      marginBottom: spacing.md,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    itemImageContainer: {
      position: 'relative',
    },
    itemImage: {
      width: '100%',
      height: 150,
    },
    stockBadge: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      backgroundColor: colors.status.warning,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
    },
    stockText: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.bold,
      color: colors.background.primary,
    },
    itemInfo: {
      padding: spacing.md,
    },
    itemName: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    itemDescription: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
      marginBottom: spacing.md,
      lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    },
    itemFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    tokenPrice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    tokenPriceText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.bold,
      color: '#4CAF50',
    },
    redeemButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
    },
    redeemButtonDisabled: {
      backgroundColor: colors.border.light,
    },
    redeemButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.background.primary,
    },
    redeemButtonTextDisabled: {
      color: colors.text.secondary,
    },
    bottomInfo: {
      backgroundColor: colors.background.secondary,
      padding: spacing.lg,
      alignItems: 'center',
    },
    bottomInfoText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    earnTokensButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 8,
    },
    earnTokensButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.background.primary,
    },
  }); 

  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'all' | 'digital' | 'physical' | 'experience'>('all');
  const [studentTokens, setStudentTokens] = useState(85);
  
  const [storeItems] = useState<StoreItem[]>([
    {
      id: '1',
      name: t('store.merchandise'),
      description: t('store.merchandiseDesc'),
      imageUrl: 'https://via.placeholder.com/100',
      tokenPrice: 40,
      category: 'physical',
      isAvailable: true,
      stock: 3,
    },
    {
      id: '2',
      name: t('store.customAvatar'),
      description: t('store.customAvatarDesc'),
      imageUrl: 'https://via.placeholder.com/100',
      tokenPrice: 25,
      category: 'digital',
      isAvailable: true,
    },
    {
      id: '3',
      name: t('store.studyMaterial'),
      description: t('store.studyMaterialDesc'),
      imageUrl: 'https://via.placeholder.com/100',
      tokenPrice: 30,
      category: 'physical',
      isAvailable: true,
      stock: 5,
    },
    {
      id: '4',
      name: t('store.gameTime'),
      description: t('store.gameTimeDesc'),
      imageUrl: 'https://via.placeholder.com/100',
      tokenPrice: 15,
      category: 'experience',
      isAvailable: true,
    },
    {
      id: '5',
      name: t('store.tutorSession'),
      description: t('store.tutorSessionDesc'),
      imageUrl: 'https://via.placeholder.com/100',
      tokenPrice: 75,
      category: 'experience',
      isAvailable: true,
    },
  ]);

  const getFilteredItems = () => {
    if (activeCategory === 'all') {
      return storeItems;
    }
    return storeItems.filter(item => item.category === activeCategory);
  };

  const handleRedeem = (item: StoreItem) => {
    if (!item.isAvailable) {
      Alert.alert(t('store.itemUnavailable'), t('store.itemUnavailableDesc'));
      return;
    }

    if (studentTokens < item.tokenPrice) {
      Alert.alert(
        t('store.insufficientTokens'),
        t('store.insufficientTokensDesc'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    Alert.alert(
      t('store.confirmRedeem'),
      `${t('store.confirmRedeemDesc')} "${item.name}" ${t('store.for')} ${item.tokenPrice} ${t('store.tokens')}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('store.redeem'),
          onPress: () => {
            setStudentTokens(prev => prev - item.tokenPrice);
            Alert.alert(
              t('store.redeemSuccess'),
              `${t('store.redeemSuccessDesc')} "${item.name}"!`,
              [{ text: t('common.ok') }]
            );
          },
        },
      ]
    );
  };

  const renderCategoryTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryTabs}
      contentContainerStyle={styles.categoryTabsContent}
    >
      {[
        { key: 'all', label: t('store.all') },
        { key: 'digital', label: t('store.digital') },
        { key: 'physical', label: t('store.physical') },
        { key: 'experience', label: t('store.experience') },
      ].map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.categoryTab,
            activeCategory === category.key && styles.activeCategoryTab
          ]}
          onPress={() => setActiveCategory(category.key as any)}
        >
          <Text style={[
            styles.categoryTabText,
            activeCategory === category.key && styles.activeCategoryTabText
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStoreItem = (item: StoreItem) => (
    <View key={item.id} style={styles.storeItem}>
      <View style={styles.itemImageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        {item.stock && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>{item.stock} {t('store.left')}</Text>
          </View>
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <View style={styles.itemFooter}>
          <View style={styles.tokenPrice}>
            <MaterialIcons name="monetization-on" size={16} color="#4CAF50" />
            <Text style={styles.tokenPriceText}>{item.tokenPrice}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.redeemButton,
              (!item.isAvailable || studentTokens < item.tokenPrice) && styles.redeemButtonDisabled
            ]}
            onPress={() => handleRedeem(item)}
            disabled={!item.isAvailable || studentTokens < item.tokenPrice}
          >
            <Text style={[
              styles.redeemButtonText,
              (!item.isAvailable || studentTokens < item.tokenPrice) && styles.redeemButtonTextDisabled
            ]}>
              {!item.isAvailable ? t('store.unavailable') : 
               studentTokens < item.tokenPrice ? t('store.insufficient') : t('store.redeem')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('store.title')}</Text>
          <View style={styles.tokenBalance}>
            <MaterialIcons name="monetization-on" size={20} color="#4CAF50" />
            <Text style={styles.tokenBalanceText}>{studentTokens} {t('store.tokens')}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('Rewards')}
        >
          <MaterialIcons name="history" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      {renderCategoryTabs()}

      {/* Store Items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.itemsContainer}>
          {getFilteredItems().map(renderStoreItem)}
        </View>
      </ScrollView>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.bottomInfoText}>{t('store.howToEarn')}</Text>
        <TouchableOpacity
          style={styles.earnTokensButton}
          onPress={() => navigation.navigate('Rewards')}
        >
          <Text style={styles.earnTokensButtonText}>{t('store.earnTokens')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
