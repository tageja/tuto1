/**
 * NurseMed Emergency Nursing Communication - Module 8
 * "Documentation and Rapid Reporting"
 *
 * Module 8 teaches verbal handover, ISBAR reporting, shift handover language,
 * and rapid verbal documentation to colleagues.
 *
 * 8 Lessons: Heads Up → Heads Down → Heads Together → Assessment
 * Module shell ALREADY EXISTS — do NOT insert into nursed_modules.
 */

import { getServiceClient } from '../supabase'

export async function seedModule8(moduleId: string) {
  const db = getServiceClient()

  const { data: existingLessons } = await db.from('nursed_lessons').select('id').eq('module_id', moduleId)
  for (const l of existingLessons ?? []) {
    await db.from('nursed_lesson_steps').delete().eq('lesson_id', l.id)
  }
  await db.from('nursed_lessons').delete().eq('module_id', moduleId)

  const lessons = [
    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 1 — HEADS UP  (scenario_intro → audio_shadow → script_read → quiz)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'End-of-Shift Handover to Incoming Nurse',
      title_vi: 'Bàn giao Cuối ca cho Điều dưỡng Đến ca',
      description: 'Your shift is ending. Learn the language nurses use to hand over care clearly and efficiently.',
      description_vi: 'Ca của bạn sắp kết thúc. Học ngôn ngữ điều dưỡng dùng để bàn giao chăm sóc rõ ràng và hiệu quả.',
      stage: 'heads_up',
      order_index: 1,
      est_minutes: 12,
      objective: 'Identify key handover phrases for shift change.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'Ward — End of Day Shift',
          title_vi: 'Khoa — Cuối Ca Ngày',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'Medical Ward — End of Day Shift',
            setting_vi: 'Khoa Nội — Cuối Ca Ngày',
            context_en: 'You are Nurse Lan finishing your day shift. Nurse Mai is starting the night shift. You need to hand over care of Mr. Davies in Bed 4 — he was admitted with pneumonia, is improving, but his oxygen requirement increased slightly this afternoon. You have documented everything in the notes.',
            context_vi: 'Bạn là Điều dưỡng Lan kết thúc ca ngày. Điều dưỡng Mai bắt đầu ca đêm. Bạn cần bàn giao chăm sóc ông Davies ở Giường 4 — ông nhập viện vì viêm phổi, đang cải thiện, nhưng nhu cầu oxy tăng nhẹ chiều nay. Bạn đã ghi chép mọi thứ vào hồ sơ.',
            key_phrases: [
              { en: 'I am handing over care of...', vi: 'Tôi đang bàn giao chăm sóc...' },
              { en: 'The outstanding concern is...', vi: 'Mối quan tâm còn lại là...' },
              { en: 'Please watch for...', vi: 'Xin theo dõi...' },
              { en: 'I have documented this in the notes.', vi: 'Tôi đã ghi chép điều này vào hồ sơ.' },
              { en: 'Nothing is pending except...', vi: 'Không còn gì chờ xử lý ngoại trừ...' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec ward ambient — end of shift, handover area. No dialogue. Mood: professional, efficient.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen & Repeat: Shift Handover Language',
          title_vi: 'Nghe & Lặp lại: Ngôn ngữ Bàn giao Ca',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Lan: Mai, I am handing over care of Mr. Davies in Bed 4.\nNurse Mai: Go ahead.\nNurse Lan: He was admitted with pneumonia. He is improving but his oxygen requirement went up to 4 litres this afternoon. The outstanding concern is his SpO2 — it dropped to 91 earlier. Please watch for any further drop. I have documented this in the notes. Nothing is pending except his evening antibiotics at 8 pm.\nNurse Mai: Understood. I will keep an eye on him.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Lan (female, Vietnamese accent OK, clear and structured), Nurse Mai (female, attentive). Ward handover area. Duration: 35-40 sec. Speed: 0.8x slow.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Handover Dialogue',
          title_vi: 'Đọc Hội thoại Bàn giao',
          order_index: 3,
          config: {
            script: "Nurse Lan: I am handing over care of Mr. Davies in Bed 4.\nNurse Mai: Go ahead.\nNurse Lan: He was admitted with pneumonia. The outstanding concern is his SpO2 — it dropped to 91. Please watch for any further drop. I have documented this in the notes. Nothing is pending except his evening antibiotics at 8 pm.\nNurse Mai: Understood.",
          },
        },
        {
          type: 'quiz',
          title: 'Check Your Understanding',
          title_vi: 'Kiểm tra Hiểu biết của Bạn',
          order_index: 4,
          config: {
            questions: [
              {
                id: 'm8l1q1',
                type: 'mcq',
                prompt_en: 'What does "I am handing over care of" mean?',
                prompt_vi: '"I am handing over care of" có nghĩa là gì?',
                options: [
                  { id: 'a', text: 'The nurse is leaving the hospital.', text_vi: 'Điều dưỡng đang rời bệnh viện.' },
                  { id: 'b', text: 'The nurse is formally transferring responsibility for a patient to the next shift.', text_vi: 'Điều dưỡng đang chính thức chuyển trách nhiệm chăm sóc bệnh nhân cho ca tiếp theo.' },
                  { id: 'c', text: 'The nurse is asking for help.', text_vi: 'Điều dưỡng đang xin giúp đỡ.' },
                  { id: 'd', text: 'The nurse is calling the doctor.', text_vi: 'Điều dưỡng đang gọi bác sĩ.' },
                ],
                answer: 'b',
                explanation_en: '"Handing over care" is the formal phrase for transferring patient responsibility at shift change.',
                explanation_vi: '"Handing over care" là cụm từ chính thức để chuyển trách nhiệm bệnh nhân khi đổi ca.',
              },
              {
                id: 'm8l1q2',
                type: 'mcq',
                prompt_en: 'Why say "The outstanding concern is" during handover?',
                prompt_vi: 'Tại sao nói "The outstanding concern is" khi bàn giao?',
                options: [
                  { id: 'a', text: 'To complain about the patient.', text_vi: 'Để phàn nàn về bệnh nhân.' },
                  { id: 'b', text: 'To highlight the main issue the next nurse should focus on.', text_vi: 'Để nhấn mạnh vấn đề chính điều dưỡng tiếp theo nên tập trung.' },
                  { id: 'c', text: 'To avoid giving details.', text_vi: 'Để tránh đưa chi tiết.' },
                  { id: 'd', text: 'Only for doctors.', text_vi: 'Chỉ cho bác sĩ.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase directs attention to the most important clinical concern — helps prioritise care.',
                explanation_vi: 'Cụm từ này hướng sự chú ý đến mối quan tâm lâm sàng quan trọng nhất — giúp ưu tiên chăm sóc.',
              },
              {
                id: 'm8l1q3',
                type: 'mcq',
                prompt_en: '"Nothing is pending except" — what does this communicate?',
                prompt_vi: '"Nothing is pending except" — truyền đạt điều gì?',
                options: [
                  { id: 'a', text: 'The nurse has done nothing.', text_vi: 'Điều dưỡng chưa làm gì.' },
                  { id: 'b', text: 'All tasks are complete except the specific item mentioned — clear and efficient.', text_vi: 'Tất cả nhiệm vụ đã hoàn thành ngoại trừ mục cụ thể được đề cập — rõ ràng và hiệu quả.' },
                  { id: 'c', text: 'The patient has no problems.', text_vi: 'Bệnh nhân không có vấn đề.' },
                  { id: 'd', text: 'The handover is finished.', text_vi: 'Bàn giao đã xong.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase summarises remaining tasks clearly — prevents missed care.',
                explanation_vi: 'Cụm từ này tóm tắt nhiệm vụ còn lại rõ ràng — tránh bỏ sót chăm sóc.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 2 — HEADS UP  (audio_shadow → script_read → cloze → quiz)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'On-Call Doctor Night Report',
      title_vi: 'Báo cáo Đêm cho Bác sĩ Trực',
      description: 'You need to give a verbal report to the on-call doctor. Learn the structure and key phrases.',
      description_vi: 'Bạn cần báo cáo bằng lời cho bác sĩ trực. Học cấu trúc và cụm từ chính.',
      stage: 'heads_up',
      order_index: 2,
      est_minutes: 12,
      objective: 'Use handover language when reporting to the on-call doctor.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Gives Night Report to Doctor',
          title_vi: 'Nghe: Điều dưỡng Báo cáo Đêm cho Bác sĩ',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: Doctor, this is Nurse Hoa from Ward 3. I am handing over the night report.\nDoctor: Go ahead.\nNurse: Mr. Ahmed in Bed 7 — admitted today with chest infection. The outstanding concern is his temperature — it went up to 38.5 at 22:00. I have documented this in the notes. Please watch for any further rise. Nothing is pending except his next obs at midnight. Mrs. Park in Bed 2 is stable. I have documented all changes.\nDoctor: Thank you. I will review Mr. Ahmed.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Hoa (clear, structured), Doctor (tired but attentive). Phone call, night shift. Duration: 38-42 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Night Report',
          title_vi: 'Đọc Báo cáo Đêm',
          order_index: 2,
          config: {
            script: "Nurse: Doctor, I am handing over the night report.\nMr. Ahmed in Bed 7 — the outstanding concern is his temperature. It went up to 38.5. I have documented this in the notes. Please watch for any further rise. Nothing is pending except his next obs at midnight.\nDoctor: Thank you. I will review him.",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Night Report',
          title_vi: 'Hoàn thành Báo cáo Đêm',
          order_index: 3,
          config: {
            cloze: "Nurse: I am ___ over the night report.\nMr. Ahmed — the ___ concern is his temperature. It went up to 38.5.\nI have ___ this in the notes. Please ___ for any further rise.\nNothing is ___ except his next obs at midnight.",
            script: "Nurse: I am handing over the night report.\nMr. Ahmed — the outstanding concern is his temperature. It went up to 38.5.\nI have documented this in the notes. Please watch for any further rise.\nNothing is pending except his next obs at midnight.",
          },
        },
        {
          type: 'quiz',
          title: 'Handover Structure Check',
          title_vi: 'Kiểm tra Cấu trúc Bàn giao',
          order_index: 4,
          config: {
            questions: [
              {
                id: 'm8l2q1',
                type: 'mcq',
                prompt_en: 'What does "I have documented this in the notes" achieve?',
                prompt_vi: '"I have documented this in the notes" đạt được gì?',
                options: [
                  { id: 'a', text: 'It tells the doctor to write notes.', text_vi: 'Nó bảo bác sĩ ghi hồ sơ.' },
                  { id: 'b', text: 'It confirms the information is recorded — the doctor can trust the verbal report and find details in the chart.', text_vi: 'Nó xác nhận thông tin đã được ghi — bác sĩ có thể tin báo cáo bằng lời và tìm chi tiết trong hồ sơ.' },
                  { id: 'c', text: 'It means the nurse is finished talking.', text_vi: 'Nó có nghĩa điều dưỡng đã nói xong.' },
                  { id: 'd', text: 'It is only for day shift.', text_vi: 'Chỉ cho ca ngày.' },
                ],
                answer: 'b',
                explanation_en: 'Documentation confirms accountability. Saying this builds trust that the verbal handover matches the written record.',
                explanation_vi: 'Ghi chép xác nhận trách nhiệm. Nói điều này xây dựng lòng tin rằng bàn giao bằng lời khớp với hồ sơ.',
              },
              {
                id: 'm8l2q2',
                type: 'mcq',
                prompt_en: '"Please watch for" — when do you use this phrase?',
                prompt_vi: '"Please watch for" — khi nào bạn dùng cụm từ này?',
                options: [
                  { id: 'a', text: 'When you want the next nurse to stop working.', text_vi: 'Khi bạn muốn điều dưỡng tiếp theo ngừng làm việc.' },
                  { id: 'b', text: 'When you want them to monitor for a specific change or sign.', text_vi: 'Khi bạn muốn họ theo dõi một thay đổi hoặc dấu hiệu cụ thể.' },
                  { id: 'c', text: 'Only for family members.', text_vi: 'Chỉ cho người nhà.' },
                  { id: 'd', text: 'When the patient is asleep.', text_vi: 'Khi bệnh nhân đang ngủ.' },
                ],
                answer: 'b',
                explanation_en: '"Please watch for" directs attention to a specific clinical sign to monitor — prevents missed deterioration.',
                explanation_vi: '"Please watch for" hướng sự chú ý đến dấu hiệu lâm sàng cụ thể cần theo dõi — tránh bỏ sót xấu đi.',
              },
              {
                id: 'm8l2q3',
                type: 'mcq',
                prompt_en: 'In a night report, what order is most effective?',
                prompt_vi: 'Trong báo cáo đêm, thứ tự nào hiệu quả nhất?',
                options: [
                  { id: 'a', text: 'Start with stable patients, then concerns.', text_vi: 'Bắt đầu với bệnh nhân ổn định, sau đó mới lo ngại.' },
                  { id: 'b', text: 'Start with patients who have concerns or changes — prioritise what needs action.', text_vi: 'Bắt đầu với bệnh nhân có mối quan tâm hoặc thay đổi — ưu tiên điều cần hành động.' },
                  { id: 'c', text: 'Alphabetical order by patient name.', text_vi: 'Thứ tự ABC theo tên bệnh nhân.' },
                  { id: 'd', text: 'Bed number order only.', text_vi: 'Chỉ theo thứ tự số giường.' },
                ],
                answer: 'b',
                explanation_en: 'Prioritise patients with concerns — the doctor needs to know what needs attention first.',
                explanation_vi: 'Ưu tiên bệnh nhân có mối quan tâm — bác sĩ cần biết điều gì cần chú ý trước.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 3 — HEADS DOWN  (audio_shadow → cloze → quiz)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Rapid Verbal Update at Bedside',
      title_vi: 'Cập nhật Bằng lời Nhanh tại Giường',
      description: 'A colleague arrives at the bedside. You need to give a quick verbal update. Practice the language.',
      description_vi: 'Đồng nghiệp đến bên giường. Bạn cần đưa cập nhật nhanh bằng lời. Thực hành ngôn ngữ.',
      stage: 'heads_down',
      order_index: 3,
      est_minutes: 15,
      objective: 'Deliver a rapid verbal update using handover phrases.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Gives Rapid Bedside Update',
          title_vi: 'Nghe: Điều dưỡng Đưa Cập nhật Nhanh tại Giường',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'normal',
            transcript: "Doctor: How is Mr. Costa?\nNurse: I am handing over care of Mr. Costa. He came in with abdominal pain. The outstanding concern is his blood pressure — it dropped to 95 over 60 ten minutes ago. I have documented this in the notes. Please watch for any further drop. I have given a fluid bolus. Nothing is pending except repeat obs in 15 minutes.\nDoctor: Thank you. I will review him now.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Linh (quick, clear), Doctor (at bedside). Ward, bedside. Duration: 35-40 sec. Normal speed.',
          },
        },
        {
          type: 'cloze',
          title: 'Fill in the Rapid Update',
          title_vi: 'Điền vào Cập nhật Nhanh',
          order_index: 2,
          config: {
            cloze: "Nurse: I am ___ over care of Mr. Costa. He came in with ___ pain.\nThe ___ concern is his blood pressure — it dropped to 95 over 60.\nI have ___ this in the notes. Please ___ for any further drop.\nNothing is ___ except repeat obs in 15 minutes.",
            script: "Nurse: I am handing over care of Mr. Costa. He came in with abdominal pain.\nThe outstanding concern is his blood pressure — it dropped to 95 over 60.\nI have documented this in the notes. Please watch for any further drop.\nNothing is pending except repeat obs in 15 minutes.",
          },
        },
        {
          type: 'quiz',
          title: 'Rapid Update Check',
          title_vi: 'Kiểm tra Cập nhật Nhanh',
          order_index: 3,
          config: {
            questions: [
              {
                id: 'm8l3q1',
                type: 'mcq',
                prompt_en: 'In a rapid bedside update, what should you include first?',
                prompt_vi: 'Trong cập nhật nhanh tại giường, bạn nên đưa gì trước?',
                options: [
                  { id: 'a', text: 'The patient\'s full address.', text_vi: 'Địa chỉ đầy đủ của bệnh nhân.' },
                  { id: 'b', text: 'Identification (who), reason for admission, and the outstanding concern.', text_vi: 'Nhận dạng (ai), lý do nhập viện, và mối quan tâm còn lại.' },
                  { id: 'c', text: 'What you had for lunch.', text_vi: 'Bạn ăn trưa gì.' },
                  { id: 'd', text: 'The weather.', text_vi: 'Thời tiết.' },
                ],
                answer: 'b',
                explanation_en: 'Identification, context, and concern — this is the ISBAR structure adapted for rapid update.',
                explanation_vi: 'Nhận dạng, bối cảnh và mối quan tâm — đây là cấu trúc ISBAR điều chỉnh cho cập nhật nhanh.',
              },
              {
                id: 'm8l3q2',
                type: 'mcq',
                prompt_en: 'Why mention "I have given a fluid bolus" in a rapid update?',
                prompt_vi: 'Tại sao đề cập "I have given a fluid bolus" trong cập nhật nhanh?',
                options: [
                  { id: 'a', text: 'To show off.', text_vi: 'Để khoe.' },
                  { id: 'b', text: 'To inform the doctor what action has already been taken — avoids duplicate treatment.', text_vi: 'Để thông báo cho bác sĩ hành động đã thực hiện — tránh điều trị trùng lặp.' },
                  { id: 'c', text: 'Only for ICU.', text_vi: 'Chỉ cho ICU.' },
                  { id: 'd', text: 'It is not important.', text_vi: 'Nó không quan trọng.' },
                ],
                answer: 'b',
                explanation_en: 'Reporting actions taken helps the doctor understand the current state and avoid repeating interventions.',
                explanation_vi: 'Báo cáo hành động đã thực hiện giúp bác sĩ hiểu tình trạng hiện tại và tránh lặp lại can thiệp.',
              },
              {
                id: 'm8l3q3',
                type: 'mcq',
                prompt_en: 'What does ISBAR add to SBAR?',
                prompt_vi: 'ISBAR thêm gì vào SBAR?',
                options: [
                  { id: 'a', text: 'Nothing — they are the same.', text_vi: 'Không gì — chúng giống nhau.' },
                  { id: 'b', text: 'Identification — who you are and who the patient is.', text_vi: 'Nhận dạng — bạn là ai và bệnh nhân là ai.' },
                  { id: 'c', text: 'A longer report.', text_vi: 'Báo cáo dài hơn.' },
                  { id: 'd', text: 'Only for handover.', text_vi: 'Chỉ cho bàn giao.' },
                ],
                answer: 'b',
                explanation_en: 'ISBAR = Identification + SBAR. Identification ensures the receiver knows who is speaking and which patient.',
                explanation_vi: 'ISBAR = Nhận dạng + SBAR. Nhận dạng đảm bảo người nghe biết ai đang nói và bệnh nhân nào.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 4 — HEADS DOWN  (scenario_intro → audio_shadow → script_read → cloze)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Handing Over a Deteriorating Patient Mid-Treatment',
      title_vi: 'Bàn giao Bệnh nhân Đang Xấu đi Giữa Điều trị',
      description: 'A patient is deteriorating and you must hand over mid-treatment. Learn the urgent handover language.',
      description_vi: 'Bệnh nhân đang xấu đi và bạn phải bàn giao giữa điều trị. Học ngôn ngữ bàn giao khẩn.',
      stage: 'heads_down',
      order_index: 4,
      est_minutes: 15,
      objective: 'Apply handover language when transferring a deteriorating patient.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'Ward — Patient Deteriorating During Handover',
          title_vi: 'Khoa — Bệnh nhân Xấu đi Trong Bàn giao',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'Medical Ward — Shift Change',
            setting_vi: 'Khoa Nội — Đổi Ca',
            context_en: 'Mr. Foster in Bed 8 has become more drowsy in the last 30 minutes. His GCS dropped from 15 to 12. You have called the doctor and started oxygen. The incoming nurse has just arrived. You need to hand over quickly and clearly.',
            context_vi: 'Ông Foster ở Giường 8 đã trở nên buồn ngủ hơn trong 30 phút qua. GCS giảm từ 15 xuống 12. Bạn đã gọi bác sĩ và bắt đầu thở oxy. Điều dưỡng đến ca vừa đến. Bạn cần bàn giao nhanh và rõ ràng.',
            key_phrases: [
              { en: 'I am handing over care of...', vi: 'Tôi đang bàn giao chăm sóc...' },
              { en: 'The outstanding concern is...', vi: 'Mối quan tâm còn lại là...' },
              { en: 'Please watch for...', vi: 'Xin theo dõi...' },
              { en: 'I have documented this in the notes.', vi: 'Tôi đã ghi chép điều này vào hồ sơ.' },
              { en: 'The doctor has been called.', vi: 'Bác sĩ đã được gọi.' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec ward ambient — shift change, urgent but controlled. No dialogue. Mood: urgent handover.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Hands Over Deteriorating Patient',
          title_vi: 'Nghe: Điều dưỡng Bàn giao Bệnh nhân Xấu đi',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Anh: Binh, I am handing over care of Mr. Foster in Bed 8. He has deteriorated in the last 30 minutes.\nNurse Binh: What is the situation?\nNurse Anh: His GCS dropped from 15 to 12. He is more drowsy. The outstanding concern is his level of consciousness. Please watch for any further drop. I have documented this in the notes. The doctor has been called and is on the way. I have started him on oxygen. Nothing is pending except the doctor\'s review.\nNurse Binh: Understood. I will stay with him.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Anh (urgent but clear), Nurse Binh (focused). Bedside handover. Duration: 38-42 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Urgent Handover',
          title_vi: 'Đọc Bàn giao Khẩn',
          order_index: 3,
          config: {
            script: "Nurse Anh: I am handing over care of Mr. Foster in Bed 8. He has deteriorated. His GCS dropped from 15 to 12. The outstanding concern is his level of consciousness. Please watch for any further drop. I have documented this in the notes. The doctor has been called. I have started oxygen. Nothing is pending except the doctor's review.\nNurse Binh: Understood.",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Deteriorating Patient Handover',
          title_vi: 'Hoàn thành Bàn giao Bệnh nhân Xấu đi',
          order_index: 4,
          config: {
            cloze: "Nurse: I am ___ over care of Mr. Foster. He has ___ in the last 30 minutes.\nHis GCS ___ from 15 to 12. The ___ concern is his level of ___.\nPlease ___ for any further drop. I have ___ this in the notes.\nNothing is ___ except the doctor's review.",
            script: "Nurse: I am handing over care of Mr. Foster. He has deteriorated in the last 30 minutes.\nHis GCS dropped from 15 to 12. The outstanding concern is his level of consciousness.\nPlease watch for any further drop. I have documented this in the notes.\nNothing is pending except the doctor's review.",
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 5 — HEADS DOWN  (audio_shadow → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'ISBAR Handover for a Stable Patient',
      title_vi: 'Bàn giao ISBAR cho Bệnh nhân Ổn định',
      description: 'Practice a full ISBAR handover for a stable patient. Then deliver it yourself and record.',
      description_vi: 'Thực hành bàn giao ISBAR đầy đủ cho bệnh nhân ổn định. Sau đó tự trình bày và ghi âm.',
      stage: 'heads_down',
      order_index: 5,
      est_minutes: 18,
      objective: 'Deliver a full ISBAR handover independently.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Full ISBAR Handover',
          title_vi: 'Nghe: Bàn giao ISBAR Đầy đủ',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: I am handing over care of Mrs. Nguyen in Bed 5. She is 72, admitted yesterday with a UTI. She is stable. The outstanding concern is her blood sugar — it was 12.2 this morning. Please watch for any hypo signs. I have documented this in the notes. She is on sliding scale insulin. Nothing is pending except her next blood sugar check before lunch. Any questions?\nColleague: No, thank you. I have it.",
            _instructions: 'AUDIO PRODUCER: One main speaker — Nurse (structured, clear). Brief colleague response. Handover room. Duration: 35-40 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'cloze',
          title: 'Build the ISBAR Handover',
          title_vi: 'Xây dựng Bàn giao ISBAR',
          order_index: 2,
          config: {
            cloze: "Nurse: I am ___ over care of Mrs. Nguyen in Bed 5. She is 72, admitted with a ___.\nShe is ___. The ___ concern is her blood sugar — it was 12.2.\nPlease ___ for any hypo signs. I have ___ this in the notes.\nNothing is ___ except her next blood sugar check before lunch.",
            script: "Nurse: I am handing over care of Mrs. Nguyen in Bed 5. She is 72, admitted with a UTI.\nShe is stable. The outstanding concern is her blood sugar — it was 12.2.\nPlease watch for any hypo signs. I have documented this in the notes.\nNothing is pending except her next blood sugar check before lunch.",
          },
        },
        {
          type: 'no_script',
          title: 'Speak It — No Script',
          title_vi: 'Nói — Không Kịch bản',
          order_index: 3,
          config: {
            context: 'You are handing over Mrs. Nguyen — 72, UTI, stable, blood sugar 12.2 this morning. Use ISBAR structure and key handover phrases.',
            cues: [
              'Identify: "I am handing over care of..."',
              'Background: age, reason for admission',
              'Assessment: stable, outstanding concern (blood sugar)',
              'Recommendation: "Please watch for...", "Nothing is pending except..."',
              'Confirm documentation',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your ISBAR Handover',
          title_vi: 'Ghi âm Bàn giao ISBAR của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself giving an ISBAR handover for Mrs. Nguyen. Use at least four key phrases from this module.',
            prompt_vi: 'Ghi âm bạn đưa bàn giao ISBAR cho bà Nguyen. Sử dụng ít nhất bốn cụm từ chính từ module này.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself as the nurse. Include: "I am handing over care of", "The outstanding concern is", "Please watch for", "I have documented this in the notes", "Nothing is pending except". Aim for 35-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 6 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Nurse to Nurse Shift Handover',
      title_vi: 'Luyện tập Cặp — Bàn giao Ca Điều dưỡng đến Điều dưỡng',
      description: 'Work with a partner. One plays the outgoing nurse, one plays the incoming nurse. Practice shift handover.',
      description_vi: 'Làm việc với đối tác. Một người đóng vai điều dưỡng hết ca, một người đóng vai điều dưỡng đến ca. Thực hành bàn giao ca.',
      stage: 'heads_together',
      order_index: 6,
      est_minutes: 20,
      objective: 'Practice nurse-to-nurse shift handover with a partner.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Nurse to Nurse Handover',
          title_vi: 'Kịch bản Đầy đủ — Bàn giao Điều dưỡng đến Điều dưỡng',
          order_index: 1,
          config: {
            script: "Nurse A: I am handing over care of Mr. Chen in Bed 3. He is 65, admitted with pneumonia. He is improving. The outstanding concern is his oxygen — he is on 2 litres, SpO2 was 94 at last check. Please watch for any drop below 92. I have documented this in the notes. Nothing is pending except his 2 pm medications and chest physio.\nNurse B: Any allergies?\nNurse A: No known allergies. He is on amoxicillin and paracetamol. Any questions?\nNurse B: No, thank you. I have it.",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Nurse: I am ___ over care of Mr. Chen. He is 65, admitted with ___.\nThe ___ concern is his oxygen — he is on 2 litres, SpO2 was ___.\nPlease ___ for any drop below 92. I have ___ this in the notes.\nNothing is ___ except his 2 pm medications.",
            script: "Nurse: I am handing over care of Mr. Chen. He is 65, admitted with pneumonia.\nThe outstanding concern is his oxygen — he is on 2 litres, SpO2 was 94.\nPlease watch for any drop below 92. I have documented this in the notes.\nNothing is pending except his 2 pm medications.",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Hand over a patient (choose any scenario). Nurse B: Receive the handover. Switch roles after one round.',
            cues: [
              '"I am handing over care of..."',
              '"The outstanding concern is..."',
              '"Please watch for..."',
              '"I have documented this in the notes"',
              '"Nothing is pending except..."',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Submit Your Best Round',
          title_vi: 'Nộp Vòng Tốt nhất của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record your best performance as the nurse giving a shift handover.',
            prompt_vi: 'Ghi âm phần trình diễn tốt nhất của bạn với vai điều dưỡng đưa bàn giao ca.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'PAIR PRACTICE: Complete all three rounds. Submit ONE recording — your best as the outgoing nurse. Include at least three key handover phrases. Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 7 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Nurse to Doctor Verbal Report',
      title_vi: 'Luyện tập Cặp — Báo cáo Bằng lời Điều dưỡng đến Bác sĩ',
      description: 'Give a verbal report to the doctor. One plays the nurse, one plays the doctor. Practice rapid reporting.',
      description_vi: 'Đưa báo cáo bằng lời cho bác sĩ. Một người đóng vai điều dưỡng, một người đóng vai bác sĩ. Thực hành báo cáo nhanh.',
      stage: 'heads_together',
      order_index: 7,
      est_minutes: 20,
      objective: 'Practice nurse-to-doctor verbal report with a partner.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Nurse Reports to Doctor',
          title_vi: 'Kịch bản Đầy đủ — Điều dưỡng Báo cáo cho Bác sĩ',
          order_index: 1,
          config: {
            script: "Nurse: Doctor, I am handing over a verbal update on Mr. Davies in Bed 4. He was admitted with pneumonia. The outstanding concern is his respiratory rate — it has gone up to 28. SpO2 is 91 on 4 litres. I have documented this in the notes. Please watch for any further deterioration. I have informed the charge nurse. Nothing is pending except your review.\nDoctor: Thank you. I will see him now.",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Nurse: I am ___ over a verbal update on Mr. Davies. He was admitted with ___.\nThe ___ concern is his ___ rate — it has gone up to 28. SpO2 is 91 on 4 litres.\nI have ___ this in the notes. Please ___ for any further deterioration.\nNothing is ___ except your review.",
            script: "Nurse: I am handing over a verbal update on Mr. Davies. He was admitted with pneumonia.\nThe outstanding concern is his respiratory rate — it has gone up to 28. SpO2 is 91 on 4 litres.\nI have documented this in the notes. Please watch for any further deterioration.\nNothing is pending except your review.",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Give verbal report to doctor on a deteriorating patient. Nurse B: Play the doctor. Switch roles.',
            cues: [
              'Identify patient and reason for admission',
              'State the outstanding concern with numbers',
              'Say "I have documented this in the notes"',
              '"Please watch for..."',
              '"Nothing is pending except..."',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Verbal Report',
          title_vi: 'Ghi âm Báo cáo Bằng lời của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself giving a verbal report to the doctor on a patient with respiratory concerns.',
            prompt_vi: 'Ghi âm bạn đưa báo cáo bằng lời cho bác sĩ về bệnh nhân có mối quan tâm hô hấp.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself as the nurse. Include: "I am handing over", "The outstanding concern is", "I have documented this in the notes", "Please watch for", "Nothing is pending except". Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 8 — ASSESSMENT  (quiz → cloze → recording_submit → self_reflection)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Module Assessment — Documentation & Self-Reflection',
      title_vi: 'Kiểm tra Module — Ghi chép & Tự Phản ánh',
      description: 'A comprehensive assessment of handover and documentation language. Finish by reflecting on what you have learned.',
      description_vi: 'Đánh giá toàn diện về ngôn ngữ bàn giao và ghi chép. Kết thúc bằng phản ánh những gì bạn đã học.',
      stage: 'assessment',
      order_index: 8,
      est_minutes: 25,
      objective: 'Demonstrate Module 8 handover and documentation language.',
      steps: [
        {
          type: 'quiz',
          title: 'Module 8 Knowledge Check',
          title_vi: 'Kiểm tra Kiến thức Module 8',
          order_index: 1,
          config: {
            questions: [
              {
                id: 'm8l8q1',
                type: 'mcq',
                prompt_en: '[Part A — Vocabulary] "I am handing over care of" means:',
                prompt_vi: '[Phần A — Từ vựng] "I am handing over care of" có nghĩa:',
                options: [
                  { id: 'a', text: 'The nurse is leaving the hospital.', text_vi: 'Điều dưỡng đang rời bệnh viện.' },
                  { id: 'b', text: 'The nurse is formally transferring responsibility for the patient to the next caregiver.', text_vi: 'Điều dưỡng đang chính thức chuyển trách nhiệm bệnh nhân cho người chăm sóc tiếp theo.' },
                  { id: 'c', text: 'The nurse is asking for a break.', text_vi: 'Điều dưỡng đang xin nghỉ.' },
                  { id: 'd', text: 'The patient is being discharged.', text_vi: 'Bệnh nhân đang được xuất viện.' },
                ],
                answer: 'b',
                explanation_en: 'Handing over care is the formal transfer of responsibility at shift change or handover.',
                explanation_vi: 'Handing over care là chuyển trách nhiệm chính thức khi đổi ca hoặc bàn giao.',
              },
              {
                id: 'm8l8q2',
                type: 'mcq',
                prompt_en: '[Part B — Protocol] "I have documented this in the notes" — why is this important?',
                prompt_vi: '[Phần B — Quy trình] "I have documented this in the notes" — tại sao quan trọng?',
                options: [
                  { id: 'a', text: 'To make the handover longer.', text_vi: 'Để làm bàn giao dài hơn.' },
                  { id: 'b', text: 'To confirm the information is recorded — builds trust and ensures accountability.', text_vi: 'Để xác nhận thông tin đã được ghi — xây dựng lòng tin và đảm bảo trách nhiệm.' },
                  { id: 'c', text: 'Only for night shift.', text_vi: 'Chỉ cho ca đêm.' },
                  { id: 'd', text: 'It is not important.', text_vi: 'Nó không quan trọng.' },
                ],
                answer: 'b',
                explanation_en: 'Documentation confirms accountability. Verbal handover + written record = safe and complete handover.',
                explanation_vi: 'Ghi chép xác nhận trách nhiệm. Bàn giao bằng lời + hồ sơ ghi chép = bàn giao an toàn và đầy đủ.',
              },
              {
                id: 'm8l8q3',
                type: 'mcq',
                prompt_en: '[Part C — Communication] "Please watch for" — when do you use it?',
                prompt_vi: '[Phần C — Giao tiếp] "Please watch for" — khi nào bạn dùng?',
                options: [
                  { id: 'a', text: 'When you want the next nurse to stop working.', text_vi: 'Khi bạn muốn điều dưỡng tiếp theo ngừng làm việc.' },
                  { id: 'b', text: 'When you want them to monitor for a specific clinical sign or change.', text_vi: 'Khi bạn muốn họ theo dõi một dấu hiệu hoặc thay đổi lâm sàng cụ thể.' },
                  { id: 'c', text: 'Only for doctors.', text_vi: 'Chỉ cho bác sĩ.' },
                  { id: 'd', text: 'When the patient is asleep.', text_vi: 'Khi bệnh nhân đang ngủ.' },
                ],
                answer: 'b',
                explanation_en: '"Please watch for" directs attention to a specific sign — prevents missed deterioration.',
                explanation_vi: '"Please watch for" hướng sự chú ý đến dấu hiệu cụ thể — tránh bỏ sót xấu đi.',
              },
              {
                id: 'm8l8q4',
                type: 'mcq',
                prompt_en: '[Part D — Decision] During handover, a patient suddenly deteriorates. You should:',
                prompt_vi: '[Phần D — Quyết định] Trong bàn giao, bệnh nhân đột ngột xấu đi. Bạn nên:',
                options: [
                  { id: 'a', text: 'Finish the handover first, then respond.', text_vi: 'Hoàn thành bàn giao trước, rồi mới phản ứng.' },
                  { id: 'b', text: 'Stop the handover, respond to the patient immediately, and include this in the handover.', text_vi: 'Dừng bàn giao, phản ứng với bệnh nhân ngay, và đưa điều này vào bàn giao.' },
                  { id: 'c', text: 'Ask the incoming nurse to deal with it.', text_vi: 'Yêu cầu điều dưỡng đến ca xử lý.' },
                  { id: 'd', text: 'Ignore it — you are leaving.', text_vi: 'Bỏ qua — bạn đang rời đi.' },
                ],
                answer: 'b',
                explanation_en: 'Patient safety first. Respond immediately, then complete handover including the new development.',
                explanation_vi: 'An toàn bệnh nhân trước. Phản ứng ngay, sau đó hoàn thành bàn giao bao gồm diễn biến mới.',
              },
            ],
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Full Handover',
          title_vi: 'Hoàn thành Bàn giao Đầy đủ',
          order_index: 2,
          config: {
            cloze: "Nurse: I am ___ over care of Mr. [Name] in Bed [X]. He was admitted with ___.\nThe ___ concern is ___. Please ___ for any further change.\nI have ___ this in the notes. Nothing is ___ except ___.",
            script: "Nurse: I am handing over care of Mr. [Name] in Bed [X]. He was admitted with [reason].\nThe outstanding concern is [concern]. Please watch for any further change.\nI have documented this in the notes. Nothing is pending except [task].",
          },
        },
        {
          type: 'recording_submit',
          title: 'Final Assessment Recording',
          title_vi: 'Ghi âm Đánh giá Cuối cùng',
          order_index: 3,
          config: {
            prompt_en: 'Record yourself giving a full handover. Use all five key phrases from this module.',
            prompt_vi: 'Ghi âm bạn đưa bàn giao đầy đủ. Sử dụng cả năm cụm từ chính từ module này.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: '[FINAL ASSESSMENT] You are Nurse [Your Name]. Give a handover for a patient (choose any scenario). Include: "I am handing over care of", "The outstanding concern is", "Please watch for", "I have documented this in the notes", "Nothing is pending except". Aim for 40-50 seconds.',
          },
        },
        {
          type: 'self_reflection',
          title: 'Module 8 Self-Reflection',
          title_vi: 'Tự Phản ánh Module 8',
          order_index: 4,
          config: {
            prompts: [
              {
                key: 'confidence',
                type: 'slider',
                label_en: 'How confident do you feel giving handovers in English now?',
                label_vi: 'Bạn cảm thấy tự tin đưa bàn giao bằng tiếng Anh chưa?',
              },
              {
                key: 'usefulness',
                type: 'slider',
                label_en: 'How useful was this module for your real clinical work?',
                label_vi: 'Module này có hữu ích cho công việc lâm sàng thực tế của bạn không?',
              },
              {
                key: 'difficulty',
                type: 'slider',
                label_en: 'How difficult was the handover language in this module?',
                label_vi: 'Ngôn ngữ bàn giao trong module này khó ở mức độ nào?',
              },
              {
                key: 'pair_helped',
                type: 'slider',
                label_en: 'Did the pair practice (Lessons 6 and 7) help you feel more prepared?',
                label_vi: 'Luyện tập cặp đôi (Bài 6 và 7) có giúp bạn cảm thấy sẵn sàng hơn không?',
              },
              {
                key: 'open_feedback',
                type: 'text',
                label_en: 'Which handover phrase will you try to use on your next shift?',
                label_vi: 'Bạn sẽ thử dùng cụm từ bàn giao nào trong ca làm tiếp theo?',
              },
            ],
          },
        },
      ],
    },
  ]

  for (const lessonData of lessons) {
    const { steps, description_vi: _dv, ...lessonFields } = lessonData

    const { data: lesson, error: lessonError } = await db
      .from('nursed_lessons')
      .insert({ ...lessonFields, module_id: moduleId, published: true })
      .select()
      .single()

    if (lessonError || !lesson) throw new Error(lessonError?.message ?? `Failed to create lesson: ${lessonFields.title}`)

    for (const stepData of steps) {
      const { error: stepError } = await db.from('nursed_lesson_steps').insert({
        lesson_id: lesson.id,
        type: stepData.type,
        title: stepData.title,
        title_vi: (stepData as any).title_vi ?? null,
        order_index: stepData.order_index,
        config: stepData.config,
      })

      if (stepError) throw new Error(stepError.message ?? `Failed to create step in ${lessonFields.title}`)
    }
  }
}
