import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Colors, Radius, Spacing, Typography } from "../theme";

export default function NoteModal({ visible, habitName, onSave, onSkip, onClose }) {
  const [note, setNote] = useState("");

  const handleSave = () => { onSave(note); setNote(""); };
  const handleSkip = () => { onSkip(); setNote(""); };
  const handleClose = () => { setNote(""); onClose(); };

  return (
    <Modal transparent animationType="slide" visible={visible} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>✅ {habitName}</Text>
          <Text style={styles.label}>Add a note (optional)</Text>
          <TextInput
            style={styles.input} value={note} onChangeText={setNote}
            placeholder="e.g. ran 5km, felt great!" placeholderTextColor={Colors.textMuted}
            multiline maxLength={120} autoFocus
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Complete ✓</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipBtnText}>⏭ Skip Today (streak protected)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: { backgroundColor: Colors.bgCard, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: "center", marginBottom: Spacing.lg },
  title: { fontSize: Typography.size.lg, fontFamily: "Sora_700Bold", color: Colors.text, marginBottom: Spacing.md },
  label: { fontSize: Typography.size.sm, color: Colors.textMuted, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.bgInput, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, color: Colors.text, fontSize: Typography.size.md, minHeight: 80, textAlignVertical: "top", marginBottom: Spacing.md },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: Radius.full, padding: Spacing.md, alignItems: "center", marginBottom: Spacing.sm },
  saveBtnText: { color: "#fff", fontFamily: "Sora_700Bold", fontSize: Typography.size.md },
  skipBtn: { backgroundColor: Colors.warningSoft, borderRadius: Radius.full, padding: Spacing.md, alignItems: "center", marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.warning },
  skipBtnText: { color: Colors.warning, fontFamily: "DMSans_600SemiBold", fontSize: Typography.size.sm },
  cancelBtn: { padding: Spacing.md, alignItems: "center" },
  cancelBtnText: { color: Colors.textMuted, fontSize: Typography.size.sm },
});
