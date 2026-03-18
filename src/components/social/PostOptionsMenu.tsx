import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Share,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  postId:    string;
  isOwnPost: boolean;
  onEdit?:   () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

interface OptionItem {
  label:     string;
  icon:      React.ComponentProps<typeof MaterialIcons>['name'];
  color?:    string;
  onPress:   () => void;
  separator?: boolean;
}

export default function PostOptionsMenu({
  postId,
  isOwnPost,
  onEdit,
  onDelete,
  onReport,
}: Props) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  const open  = useCallback(() => setVisible(true),  []);
  const close = useCallback(() => setVisible(false), []);

  const handleShare = useCallback(async () => {
    close();
    await Share.share({ url: `https://tuto.social/post/${postId}` });
  }, [postId, close]);

  const items: OptionItem[] = [
    ...(isOwnPost && onEdit
      ? [{ label: t('community.post.edit') as string, icon: 'edit' as const, onPress: () => { close(); onEdit(); } }]
      : []),
    ...(isOwnPost && onDelete
      ? [{
          label:  t('community.post.delete') as string,
          icon:   'delete' as const,
          color:  '#DC2626',
          separator: true,
          onPress: () => { close(); onDelete(); },
        }]
      : []),
    { label: 'Copy link', icon: 'link' as const, onPress: handleShare },
    {
      label:    t('community.post.report') as string,
      icon:     'flag' as const,
      color:    '#F97316',
      onPress:  () => { close(); onReport?.(); },
    },
  ];

  return (
    <>
      <Pressable onPress={open} hitSlop={10}>
        <MaterialIcons name="more-horiz" size={22} color="#9CA3AF" />
      </Pressable>

      <Modal transparent visible={visible} onRequestClose={close} animationType="fade">
        <TouchableWithoutFeedback onPress={close}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={styles.sheet}>
          {items.map((item, i) => (
            <React.Fragment key={item.label}>
              {item.separator && i > 0 && <View style={styles.divider} />}
              <Pressable style={styles.option} onPress={item.onPress}>
                <MaterialIcons
                  name={item.icon}
                  size={20}
                  color={item.color ?? '#374151'}
                />
                <Text style={[styles.optionText, item.color ? { color: item.color } : null]}>
                  {item.label}
                </Text>
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000060',
  },
  sheet: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    backgroundColor: '#fff',
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    paddingBottom:   32,
    paddingTop:      16,
  },
  divider: {
    height:          1,
    backgroundColor: '#F3F4F6',
    marginVertical:  4,
  },
  option: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  optionText: {
    fontSize:   16,
    color:      '#374151',
    fontWeight: '500',
  },
});
