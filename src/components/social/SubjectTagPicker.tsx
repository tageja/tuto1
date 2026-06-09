import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';

const SUBJECTS = [
  'Toán',
  'Tiếng Anh',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'Lịch sử',
  'Địa lý',
  'IELTS',
  'STEM',
  'Tin học',
];

const MAX_TAGS = 3;

interface Props {
  visible:   boolean;
  selected:  string[];
  onConfirm: (tags: string[]) => void;
  onClose:   () => void;
}

export default function SubjectTagPicker({ visible, selected, onConfirm, onClose }: Props) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<string[]>(selected);

  useEffect(() => {
    if (visible) setDraft(selected);
  }, [visible, selected]);

  const toggleTag = (tag: string) => {
    setDraft((prev) => {
      if (prev.includes(tag)) return prev.filter((s) => s !== tag);
      if (prev.length >= MAX_TAGS) return prev;
      return [...prev, tag];
    });
  };

  const handleConfirm = () => {
    onConfirm(draft);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Title row */}
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Text style={styles.cancelBtn}>{t('community.composer.cancel') as string}</Text>
          </Pressable>
          <Text style={styles.title}>{t('community.composer.subjects') as string}</Text>
          <Pressable onPress={handleConfirm}>
            <Text style={styles.doneBtn}>{t('community.composer.done') as string}</Text>
          </Pressable>
        </View>

        {/* Hint */}
        <Text style={styles.hint}>
          {`${draft.length}/${MAX_TAGS} môn đã chọn`}
        </Text>

        {/* Tags */}
        <ScrollView contentContainerStyle={styles.tags} showsVerticalScrollIndicator={false}>
          {SUBJECTS.map((tag) => {
            const isSelected = draft.includes(tag);
            const isDisabled = !isSelected && draft.length >= MAX_TAGS;
            return (
              <Pressable
                key={tag}
                style={[
                  styles.tag,
                  isSelected && styles.tagSelected,
                  isDisabled && styles.tagDisabled,
                ]}
                onPress={() => toggleTag(tag)}
                disabled={isDisabled}
              >
                <Text
                  style={[
                    styles.tagText,
                    isSelected && styles.tagTextSelected,
                    isDisabled && styles.tagTextDisabled,
                  ]}
                >
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    paddingBottom:        32,
    maxHeight:            '60%',
  },
  handle: {
    width:        40,
    height:       4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf:   'center',
    marginTop:   10,
    marginBottom: 4,
  },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize:   16,
    fontWeight: '700',
    color:      '#111827',
  },
  cancelBtn: {
    fontSize: 15,
    color:    '#6B7280',
  },
  doneBtn: {
    fontSize:   15,
    fontWeight: '700',
    color:      '#0B5FFF',
  },
  hint: {
    fontSize:          12,
    color:             '#9CA3AF',
    textAlign:         'center',
    paddingVertical:   8,
  },
  tags: {
    flexDirection:     'row',
    flexWrap:          'wrap',
    paddingHorizontal: 16,
    gap:               10,
    paddingBottom:     16,
  },
  tag: {
    borderRadius:      999,
    borderWidth:       1,
    borderColor:       '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical:   8,
    backgroundColor:   '#F9FAFC',
  },
  tagSelected: {
    backgroundColor: '#0B5FFF',
    borderColor:     '#0B5FFF',
  },
  tagDisabled: {
    opacity: 0.4,
  },
  tagText: {
    fontSize:   14,
    fontWeight: '500',
    color:      '#374151',
  },
  tagTextSelected: {
    color: '#fff',
  },
  tagTextDisabled: {
    color: '#9CA3AF',
  },
});
