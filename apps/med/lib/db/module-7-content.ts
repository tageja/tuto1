/**
 * NurseMed Emergency Nursing Communication - Module 7
 * "Red Flags & Escalation"
 *
 * Module 7 teaches nurses to recognise and verbally escalate clinical red flags:
 * sepsis, stroke, cardiac events, anaphylaxis. Rapid response team language.
 *
 * 8 Lessons: Heads Up → Heads Down → Heads Together → Assessment
 * Module shell ALREADY EXISTS — do NOT insert into nursed_modules.
 */

import { getServiceClient } from '../supabase'

export async function seedModule7(moduleId: string) {
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
      title: 'Calling a Code Blue',
      title_vi: 'Gọi Code Blue',
      description: 'A patient has collapsed. Learn the exact language used to call a cardiac arrest and summon the team.',
      description_vi: 'Bệnh nhân đã ngã. Học ngôn ngữ chính xác dùng để gọi ngừng tim và triệu tập đội ngũ.',
      stage: 'heads_up',
      order_index: 1,
      est_minutes: 12,
      objective: 'Identify key phrases for calling a code and rapid response.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'Ward — Patient Collapse',
          title_vi: 'Khoa — Bệnh nhân Ngã',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'Medical Ward — Morning Round',
            setting_vi: 'Khoa Nội — Buổi Sáng',
            context_en: 'Mr. Davies, 62, has just collapsed in the corridor. He is unresponsive, no pulse. You need to call a Code Blue immediately and start CPR. Every second counts.',
            context_vi: 'Ông Davies, 62 tuổi, vừa ngã trong hành lang. Ông không phản ứng, không có mạch. Bạn cần gọi Code Blue ngay lập tức và bắt đầu CPR. Mỗi giây đều quan trọng.',
            key_phrases: [
              { en: 'I am calling a code.', vi: 'Tôi đang gọi code.' },
              { en: 'I need the rapid response team NOW.', vi: 'Tôi cần đội phản ứng nhanh NGAY BÂY GIỜ.' },
              { en: 'Can you stop what you are doing and come immediately?', vi: 'Bạn có thể dừng việc đang làm và đến ngay không?' },
              { en: 'Bed 4, Ward 3 — cardiac arrest.', vi: 'Giường 4, Khoa 3 — ngừng tim.' },
              { en: 'We need the crash trolley.', vi: 'Chúng tôi cần xe cấp cứu.' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec ward ambient — alarm, running footsteps, urgent voices. No dialogue. Mood: emergency, high urgency.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen & Repeat: Code Blue Call',
          title_vi: 'Nghe & Lặp lại: Gọi Code Blue',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: Emergency! I am calling a code! Bed 4, Ward 3! Cardiac arrest!\nOperator: Code Blue, Ward 3, Bed 4. Team responding.\nNurse: I need the rapid response team NOW. Patient is unresponsive, no pulse. We have started CPR.\nOperator: Defibrillator and crash trolley on the way. How long since collapse?\nNurse: About one minute. Can you stop what you are doing and come immediately? We need everyone.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse (female, urgent but clear, Vietnamese accent OK), Operator (calm, procedural). Phone/bleep context. Duration: 35-40 sec. Speed: 0.8x slow.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Code Blue Dialogue',
          title_vi: 'Đọc Hội thoại Code Blue',
          order_index: 3,
          config: {
            script: "Nurse: Emergency! I am calling a code! Bed 4, Ward 3! Cardiac arrest!\nOperator: Code Blue, Ward 3, Bed 4. Team responding.\nNurse: I need the rapid response team NOW. Patient is unresponsive, no pulse.\nOperator: Defibrillator on the way.\nNurse: Can you stop what you are doing and come immediately?",
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
                id: 'm7l1q1',
                type: 'mcq',
                prompt_en: 'What does "I am calling a code" mean?',
                prompt_vi: '"I am calling a code" có nghĩa là gì?',
                options: [
                  { id: 'a', text: 'The nurse is calling a patient.', text_vi: 'Điều dưỡng đang gọi bệnh nhân.' },
                  { id: 'b', text: 'A cardiac arrest or life-threatening emergency is being announced — all available staff should respond.', text_vi: 'Ngừng tim hoặc cấp cứu đe dọa tính mạng đang được thông báo — tất cả nhân viên có mặt nên phản ứng.' },
                  { id: 'c', text: 'The nurse is calling the doctor for a routine review.', text_vi: 'Điều dưỡng đang gọi bác sĩ để khám định kỳ.' },
                  { id: 'd', text: 'A fire alarm is being activated.', text_vi: 'Chuông báo cháy đang được kích hoạt.' },
                ],
                answer: 'b',
                explanation_en: '"Calling a code" announces a life-threatening emergency. In many hospitals, Code Blue = cardiac arrest.',
                explanation_vi: '"Calling a code" thông báo cấp cứu đe dọa tính mạng. Ở nhiều bệnh viện, Code Blue = ngừng tim.',
              },
              {
                id: 'm7l1q2',
                type: 'mcq',
                prompt_en: 'Why say "Can you stop what you are doing and come immediately?"',
                prompt_vi: 'Tại sao nói "Bạn có thể dừng việc đang làm và đến ngay không?"',
                options: [
                  { id: 'a', text: 'To be rude to colleagues.', text_vi: 'Để thô lỗ với đồng nghiệp.' },
                  { id: 'b', text: 'To signal that this is an emergency requiring immediate action — drop everything.', text_vi: 'Để báo hiệu đây là cấp cứu cần hành động ngay — bỏ mọi thứ.' },
                  { id: 'c', text: 'To ask someone to finish their task first.', text_vi: 'Để yêu cầu ai đó hoàn thành công việc trước.' },
                  { id: 'd', text: 'Only for doctors.', text_vi: 'Chỉ cho bác sĩ.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase makes clear that routine tasks must stop. It is assertive and appropriate in a true emergency.',
                explanation_vi: 'Cụm từ này làm rõ công việc thường lệ phải dừng. Nó quyết đoán và phù hợp trong cấp cứu thực sự.',
              },
              {
                id: 'm7l1q3',
                type: 'mcq',
                prompt_en: 'When calling a code, what information should you give first?',
                prompt_vi: 'Khi gọi code, thông tin nào bạn nên đưa trước?',
                options: [
                  { id: 'a', text: 'The patient\'s full medical history.', text_vi: 'Tiền sử bệnh đầy đủ của bệnh nhân.' },
                  { id: 'b', text: 'Location and type of emergency — e.g. Bed 4, Ward 3, cardiac arrest.', text_vi: 'Vị trí và loại cấp cứu — ví dụ Giường 4, Khoa 3, ngừng tim.' },
                  { id: 'c', text: 'The nurse\'s name.', text_vi: 'Tên điều dưỡng.' },
                  { id: 'd', text: 'What medication the patient is on.', text_vi: 'Bệnh nhân đang dùng thuốc gì.' },
                ],
                answer: 'b',
                explanation_en: 'Location and emergency type first — so the team knows where to go and what to bring.',
                explanation_vi: 'Vị trí và loại cấp cứu trước — để đội biết đi đâu và mang gì.',
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
      title: 'Recognising Stroke Symptoms — FAST',
      title_vi: 'Nhận biết Triệu chứng Đột quỵ — FAST',
      description: 'A patient shows signs of stroke. Learn to recognise and report using the FAST acronym.',
      description_vi: 'Bệnh nhân có dấu hiệu đột quỵ. Học cách nhận biết và báo cáo bằng từ viết tắt FAST.',
      stage: 'heads_up',
      order_index: 2,
      est_minutes: 12,
      objective: 'Use stroke recognition language (FAST) when escalating.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Reports Stroke Symptoms',
          title_vi: 'Nghe: Điều dưỡng Báo cáo Triệu chứng Đột quỵ',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: Doctor, this is Nurse Mai. I need you to come to Bed 7 immediately.\nDoctor: What is the issue?\nNurse: His symptoms suggest a stroke. Face drooping on one side, arm weakness, speech slurred. FAST positive. He is 68, came in with headache an hour ago.\nDoctor: When did the symptoms start?\nNurse: About 20 minutes ago. I am calling the stroke team. Can you stop what you are doing and come immediately?",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Mai (urgent, factual), Doctor (alert, responsive). Phone call. Duration: 35-40 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Stroke Escalation',
          title_vi: 'Đọc Báo cáo Khẩn Đột quỵ',
          order_index: 2,
          config: {
            script: "Nurse: Doctor, his symptoms suggest a stroke. Face drooping, arm weakness, speech slurred. FAST positive.\nDoctor: When did it start?\nNurse: About 20 minutes ago. I need you to come immediately. I am calling the stroke team.",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Stroke Report',
          title_vi: 'Hoàn thành Báo cáo Đột quỵ',
          order_index: 3,
          config: {
            cloze: "Nurse: His ___ suggest a stroke. Face ___, arm weakness, speech ___. FAST ___.\nDoctor: When did it start?\nNurse: About 20 minutes ago. I need you to come ___. I am calling the ___ team.",
            script: "Nurse: His symptoms suggest a stroke. Face drooping, arm weakness, speech slurred. FAST positive.\nDoctor: When did it start?\nNurse: About 20 minutes ago. I need you to come immediately. I am calling the stroke team.",
          },
        },
        {
          type: 'quiz',
          title: 'Stroke Recognition Check',
          title_vi: 'Kiểm tra Nhận biết Đột quỵ',
          order_index: 4,
          config: {
            questions: [
              {
                id: 'm7l2q1',
                type: 'mcq',
                prompt_en: 'What does FAST stand for in stroke assessment?',
                prompt_vi: 'FAST trong đánh giá đột quỵ là viết tắt của gì?',
                options: [
                  { id: 'a', text: 'Face, Arms, Speech, Time', text_vi: 'Mặt, Tay, Lời nói, Thời gian' },
                  { id: 'b', text: 'First, Alert, Safe, Treat', text_vi: 'Đầu tiên, Cảnh báo, An toàn, Điều trị' },
                  { id: 'c', text: 'Fast, Action, Save, Time', text_vi: 'Nhanh, Hành động, Cứu, Thời gian' },
                  { id: 'd', text: 'Fever, Airway, Shock, Trauma', text_vi: 'Sốt, Đường thở, Sốc, Chấn thương' },
                ],
                answer: 'a',
                explanation_en: 'FAST: Face (drooping), Arms (weakness), Speech (slurred), Time (call immediately — time is brain).',
                explanation_vi: 'FAST: Mặt (xệ), Tay (yếu), Lời nói (nói lắp), Thời gian (gọi ngay — thời gian là não).',
              },
              {
                id: 'm7l2q2',
                type: 'mcq',
                prompt_en: '"His symptoms suggest a stroke" — what does this phrase do?',
                prompt_vi: '"His symptoms suggest a stroke" — cụm từ này làm gì?',
                options: [
                  { id: 'a', text: 'It gives a final diagnosis.', text_vi: 'Nó đưa ra chẩn đoán cuối cùng.' },
                  { id: 'b', text: 'It communicates clinical suspicion clearly — prompts urgent review without overstating.', text_vi: 'Nó truyền đạt nghi ngờ lâm sàng rõ ràng — thúc đẩy khám khẩn mà không phóng đại.' },
                  { id: 'c', text: 'It is only for neurologists.', text_vi: 'Chỉ cho bác sĩ thần kinh.' },
                  { id: 'd', text: 'It means the nurse is not sure.', text_vi: 'Nó có nghĩa điều dưỡng không chắc.' },
                ],
                answer: 'b',
                explanation_en: '"Suggest" is appropriate — you are reporting your assessment, not making a definitive diagnosis. It triggers urgent action.',
                explanation_vi: '"Suggest" phù hợp — bạn đang báo cáo đánh giá của mình, không đưa chẩn đoán chắc chắn. Nó kích hoạt hành động khẩn.',
              },
              {
                id: 'm7l2q3',
                type: 'mcq',
                prompt_en: 'Why is "time" critical in stroke escalation?',
                prompt_vi: 'Tại sao "thời gian" quan trọng trong báo cáo đột quỵ?',
                options: [
                  { id: 'a', text: 'To finish the shift on time.', text_vi: 'Để kết thúc ca đúng giờ.' },
                  { id: 'b', text: 'Stroke treatment is time-sensitive — faster treatment means better outcomes.', text_vi: 'Điều trị đột quỵ nhạy cảm với thời gian — điều trị nhanh hơn có kết quả tốt hơn.' },
                  { id: 'c', text: 'To avoid overtime.', text_vi: 'Để tránh tăng ca.' },
                  { id: 'd', text: 'It is not critical.', text_vi: 'Nó không quan trọng.' },
                ],
                answer: 'b',
                explanation_en: 'Time is brain. Thrombolysis and thrombectomy have narrow time windows. Report onset time when escalating stroke.',
                explanation_vi: 'Thời gian là não. Tiêu huyết khối và lấy huyết khối có cửa sổ thời gian hẹp. Báo cáo thời gian khởi phát khi báo cáo đột quỵ.',
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
      title: 'Anaphylaxis After Medication',
      title_vi: 'Sốc Phản vệ Sau Thuốc',
      description: 'A patient has a severe allergic reaction. Learn to recognise and escalate anaphylaxis immediately.',
      description_vi: 'Bệnh nhân có phản ứng dị ứng nặng. Học cách nhận biết và báo cáo sốc phản vệ ngay lập tức.',
      stage: 'heads_down',
      order_index: 3,
      est_minutes: 15,
      objective: 'Use anaphylaxis recognition and escalation language.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Escalates Anaphylaxis',
          title_vi: 'Nghe: Điều dưỡng Báo cáo Sốc Phản vệ',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'normal',
            transcript: "Nurse: Emergency! I need the rapid response team NOW! Bed 2, Ward 5!\nDoctor: What is happening?\nNurse: She is showing signs of anaphylaxis. She had penicillin five minutes ago. Now she has rash, swelling, difficulty breathing. Blood pressure dropping.\nDoctor: Is she on oxygen? Have you given adrenaline?\nNurse: Yes, oxygen and adrenaline given. I need you to stop what you are doing and come immediately. Her airway may be closing.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse (urgent, clear), Doctor (alert). Ward emergency. Duration: 38-42 sec. Normal speed.',
          },
        },
        {
          type: 'cloze',
          title: 'Fill in the Anaphylaxis Report',
          title_vi: 'Điền vào Báo cáo Sốc Phản vệ',
          order_index: 2,
          config: {
            cloze: "Nurse: I need the rapid ___ team NOW! Bed 2, Ward 5!\nShe is showing ___ of anaphylaxis. She had ___ five minutes ago.\nNow she has ___, swelling, difficulty ___. Blood pressure ___.\nI need you to ___ what you are doing and come ___.",
            script: "Nurse: I need the rapid response team NOW! Bed 2, Ward 5!\nShe is showing signs of anaphylaxis. She had penicillin five minutes ago.\nNow she has rash, swelling, difficulty breathing. Blood pressure dropping.\nI need you to stop what you are doing and come immediately.",
          },
        },
        {
          type: 'quiz',
          title: 'Anaphylaxis Escalation',
          title_vi: 'Báo cáo Khẩn Sốc Phản vệ',
          order_index: 3,
          config: {
            questions: [
              {
                id: 'm7l3q1',
                type: 'mcq',
                prompt_en: '"She is showing signs of anaphylaxis" — what should you include when reporting?',
                prompt_vi: '"She is showing signs of anaphylaxis" — bạn nên bao gồm gì khi báo cáo?',
                options: [
                  { id: 'a', text: 'Only the diagnosis.', text_vi: 'Chỉ chẩn đoán.' },
                  { id: 'b', text: 'Trigger (e.g. medication), symptoms (rash, swelling, breathing), and what you have done.', text_vi: 'Tác nhân (ví dụ thuốc), triệu chứng (phát ban, sưng, thở), và bạn đã làm gì.' },
                  { id: 'c', text: 'The patient\'s address.', text_vi: 'Địa chỉ bệnh nhân.' },
                  { id: 'd', text: 'Nothing else — the phrase is enough.', text_vi: 'Không gì khác — cụm từ đủ rồi.' },
                ],
                answer: 'b',
                explanation_en: 'Include trigger, symptoms, and actions taken. This helps the team respond appropriately.',
                explanation_vi: 'Bao gồm tác nhân, triệu chứng và hành động đã thực hiện. Điều này giúp đội phản ứng phù hợp.',
              },
              {
                id: 'm7l3q2',
                type: 'mcq',
                prompt_en: 'Why say "Her airway may be closing" when escalating anaphylaxis?',
                prompt_vi: 'Tại sao nói "Đường thở của cô ấy có thể đang đóng" khi báo cáo sốc phản vệ?',
                options: [
                  { id: 'a', text: 'To scare the doctor.', text_vi: 'Để làm bác sĩ sợ.' },
                  { id: 'b', text: 'To communicate urgency — airway compromise is life-threatening and needs immediate response.', text_vi: 'Để truyền đạt sự khẩn cấp — tổn thương đường thở đe dọa tính mạng và cần phản ứng ngay.' },
                  { id: 'c', text: 'It is optional.', text_vi: 'Nó là tùy chọn.' },
                  { id: 'd', text: 'Only for anaesthetists.', text_vi: 'Chỉ cho bác sĩ gây mê.' },
                ],
                answer: 'b',
                explanation_en: 'Airway compromise in anaphylaxis can be fatal. Stating it clearly ensures the right team and equipment respond.',
                explanation_vi: 'Tổn thương đường thở trong sốc phản vệ có thể gây tử vong. Nêu rõ đảm bảo đội và thiết bị phù hợp phản ứng.',
              },
              {
                id: 'm7l3q3',
                type: 'mcq',
                prompt_en: 'What is the first-line treatment for anaphylaxis?',
                prompt_vi: 'Điều trị đầu tay cho sốc phản vệ là gì?',
                options: [
                  { id: 'a', text: 'Antibiotics.', text_vi: 'Kháng sinh.' },
                  { id: 'b', text: 'Adrenaline (epinephrine).', text_vi: 'Adrenaline (epinephrine).' },
                  { id: 'c', text: 'Paracetamol.', text_vi: 'Paracetamol.' },
                  { id: 'd', text: 'IV fluids only.', text_vi: 'Chỉ truyền dịch.' },
                ],
                answer: 'b',
                explanation_en: 'Adrenaline is first-line for anaphylaxis. When escalating, report if you have given it and the dose.',
                explanation_vi: 'Adrenaline là điều trị đầu tay cho sốc phản vệ. Khi báo cáo, báo cáo nếu bạn đã cho và liều.',
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
      title: 'Sepsis Screening Communication',
      title_vi: 'Giao tiếp Sàng lọc Nhiễm trùng huyết',
      description: 'A patient meets sepsis criteria. Learn to communicate the screening findings and escalate urgently.',
      description_vi: 'Bệnh nhân đáp ứng tiêu chí nhiễm trùng huyết. Học cách truyền đạt kết quả sàng lọc và báo cáo khẩn.',
      stage: 'heads_down',
      order_index: 4,
      est_minutes: 15,
      objective: 'Apply sepsis screening language when escalating.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'Ward — Suspected Sepsis',
          title_vi: 'Khoa — Nghi ngờ Nhiễm trùng huyết',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'Medical Ward — Night Shift',
            setting_vi: 'Khoa Nội — Ca Đêm',
            context_en: 'Mrs. Park, 71, was admitted with a UTI. Her temperature is now 39.2, heart rate 118, blood pressure 88/55, and she is confused. She meets sepsis criteria. You need to escalate immediately and request the sepsis protocol.',
            context_vi: 'Bà Park, 71 tuổi, nhập viện vì nhiễm trùng tiểu. Nhiệt độ hiện 39.2, nhịp tim 118, huyết áp 88/55, và bà lú lẫn. Bà đáp ứng tiêu chí nhiễm trùng huyết. Bạn cần báo cáo ngay và yêu cầu protocol nhiễm trùng huyết.',
            key_phrases: [
              { en: 'She meets sepsis criteria.', vi: 'Bà ấy đáp ứng tiêu chí nhiễm trùng huyết.' },
              { en: 'I need the rapid response team NOW.', vi: 'Tôi cần đội phản ứng nhanh NGAY BÂY GIỜ.' },
              { en: 'Temperature 39.2, heart rate 118, BP 88 over 55.', vi: 'Nhiệt độ 39.2, nhịp tim 118, HA 88/55.' },
              { en: 'She has become confused in the last hour.', vi: 'Bà ấy đã lú lẫn trong giờ qua.' },
              { en: 'I recommend sepsis protocol and blood cultures.', vi: 'Tôi khuyến nghị protocol nhiễm trùng huyết và cấy máu.' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec ward ambient — night shift, monitor alarms. No dialogue. Mood: urgent, clinical.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Escalates Sepsis',
          title_vi: 'Nghe: Điều dưỡng Báo cáo Nhiễm trùng huyết',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: Doctor, this is Nurse Hoa from Ward 4. I need you to come to Bed 6 immediately.\nDoctor: What is the concern?\nNurse: Mrs. Park meets sepsis criteria. Temperature 39.2, heart rate 118, blood pressure 88 over 55. She has become confused in the last hour. She was admitted with a UTI.\nDoctor: Have you taken blood cultures?\nNurse: Not yet. I need the rapid response team NOW. I recommend sepsis protocol and blood cultures. Can you stop what you are doing and come immediately?",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Hoa (urgent, structured), Doctor (alert). Phone call. Duration: 38-42 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Sepsis Escalation',
          title_vi: 'Đọc Báo cáo Khẩn Nhiễm trùng huyết',
          order_index: 3,
          config: {
            script: "Nurse: Doctor, Mrs. Park meets sepsis criteria. Temperature 39.2, heart rate 118, BP 88 over 55. She has become confused.\nDoctor: Have you taken blood cultures?\nNurse: Not yet. I need the rapid response team NOW. I recommend sepsis protocol. Can you come immediately?",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Sepsis Report',
          title_vi: 'Hoàn thành Báo cáo Nhiễm trùng huyết',
          order_index: 4,
          config: {
            cloze: "Nurse: Mrs. Park ___ sepsis criteria. Temperature ___, heart rate 118, blood pressure 88 over ___.\nShe has become ___ in the last hour. I need the rapid ___ team NOW.\nI recommend ___ protocol and blood cultures. Can you ___ what you are doing and come ___?",
            script: "Nurse: Mrs. Park meets sepsis criteria. Temperature 39.2, heart rate 118, blood pressure 88 over 55.\nShe has become confused in the last hour. I need the rapid response team NOW.\nI recommend sepsis protocol and blood cultures. Can you stop what you are doing and come immediately?",
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 5 — HEADS DOWN  (audio_shadow → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Chest Pain — Possible MI',
      title_vi: 'Đau Ngực — Có thể Nhồi máu cơ tim',
      description: 'A patient has sudden chest pain. Practice escalating a possible cardiac event and record yourself.',
      description_vi: 'Bệnh nhân đau ngực đột ngột. Thực hành báo cáo khẩn sự cố tim có thể và ghi âm.',
      stage: 'heads_down',
      order_index: 5,
      est_minutes: 18,
      objective: 'Deliver an escalation call for possible myocardial infarction.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Escalates Chest Pain',
          title_vi: 'Nghe: Điều dưỡng Báo cáo Đau ngực',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: Doctor, this is Nurse Linh. I need you to come to Room 8 immediately. Mr. Costa has developed chest pain in the last 15 minutes.\nDoctor: What are his vitals?\nNurse: BP 150 over 95, heart rate 102. He says the pain goes down his left arm. He is sweating. I am concerned this could be an MI. I need the rapid response team NOW.\nDoctor: Is he on oxygen? Aspirin given?\nNurse: Oxygen and aspirin given. Can you stop what you are doing and come immediately?",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Linh (urgent, factual), Doctor (alert). Ward phone. Duration: 38-42 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'cloze',
          title: 'Build the Chest Pain Escalation',
          title_vi: 'Xây dựng Báo cáo Khẩn Đau ngực',
          order_index: 2,
          config: {
            cloze: "Nurse: I need you to come to Room 8 ___. Mr. Costa has developed ___ pain in the last 15 minutes.\nBP 150 over 95, heart rate ___. The pain goes down his ___ arm. He is ___.\nI am concerned this could be an ___. I need the rapid ___ team NOW.\nCan you ___ what you are doing and come ___?",
            script: "Nurse: I need you to come to Room 8 immediately. Mr. Costa has developed chest pain in the last 15 minutes.\nBP 150 over 95, heart rate 102. The pain goes down his left arm. He is sweating.\nI am concerned this could be an MI. I need the rapid response team NOW.\nCan you stop what you are doing and come immediately?",
          },
        },
        {
          type: 'no_script',
          title: 'Speak It — No Script',
          title_vi: 'Nói — Không Kịch bản',
          order_index: 3,
          config: {
            context: 'You are calling to escalate Mr. Costa with chest pain. Use the key phrases: location, symptoms, vitals, concern (possible MI), and request for rapid response.',
            cues: [
              'Identify location and patient',
              'State the chest pain and when it started',
              'Give vitals — BP, heart rate',
              'Mention radiation (arm) and sweating',
              'State concern: possible MI',
              'Request rapid response and "come immediately"',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Chest Pain Escalation',
          title_vi: 'Ghi âm Báo cáo Đau ngực của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself escalating a patient with chest pain and possible MI.',
            prompt_vi: 'Ghi âm bạn báo cáo bệnh nhân đau ngực và có thể nhồi máu cơ tim.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself as the nurse. Include: patient name and location, chest pain with radiation, vitals, "I am concerned this could be an MI", "I need the rapid response team NOW", "Can you stop what you are doing and come immediately?" Aim for 35-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 6 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Unresponsive Patient',
      title_vi: 'Luyện tập Cặp — Bệnh nhân Không phản ứng',
      description: 'Work with a partner. One plays the nurse calling rapid response, one plays the doctor. Practice escalation language.',
      description_vi: 'Làm việc với đối tác. Một người đóng vai điều dưỡng gọi phản ứng nhanh, một người đóng vai bác sĩ. Thực hành ngôn ngữ báo cáo.',
      stage: 'heads_together',
      order_index: 6,
      est_minutes: 20,
      objective: 'Practice rapid response escalation with a partner.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Nurse Calls Rapid Response',
          title_vi: 'Kịch bản Đầy đủ — Điều dưỡng Gọi Phản ứng Nhanh',
          order_index: 1,
          config: {
            script: "Nurse: Emergency! I need the rapid response team NOW! Bed 3, Ward 2! Patient unresponsive!\nDoctor: What is the situation?\nNurse: Mr. Ahmed is unresponsive. GCS 6. He was alert an hour ago. Admitted with pneumonia. Blood pressure 85 over 50, heart rate 125.\nDoctor: Airway clear? Oxygen?\nNurse: Airway clear, oxygen on. I am calling a code if he does not improve. Can you stop what you are doing and come immediately?",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Nurse: I need the rapid ___ team NOW! Bed 3, Ward 2! Patient ___!\nMr. Ahmed is ___. GCS 6. He was ___ an hour ago. BP 85 over 50, heart rate ___.\nI am calling a ___ if he does not improve. Can you ___ what you are doing and come ___?",
            script: "Nurse: I need the rapid response team NOW! Bed 3, Ward 2! Patient unresponsive!\nMr. Ahmed is unresponsive. GCS 6. He was alert an hour ago. BP 85 over 50, heart rate 125.\nI am calling a code if he does not improve. Can you stop what you are doing and come immediately?",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Play the nurse calling rapid response for unresponsive patient. Nurse B: Play the doctor. Switch roles after one round.',
            cues: [
              'State "I need the rapid response team NOW"',
              'Give location and patient name',
              'Report unresponsive, GCS if known',
              'Give vitals — BP, heart rate',
              'Say "Can you stop what you are doing and come immediately?"',
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
            prompt_en: 'Record your best performance as the nurse calling rapid response.',
            prompt_vi: 'Ghi âm phần trình diễn tốt nhất của bạn với vai điều dưỡng gọi phản ứng nhanh.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'PAIR PRACTICE: Complete all three rounds. Submit ONE recording — your best as the nurse. Include at least two key escalation phrases. Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 7 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Paediatric Emergency Escalation',
      title_vi: 'Luyện tập Cặp — Báo cáo Khẩn Cấp cứu Nhi khoa',
      description: 'A child has deteriorated. Practice escalating a paediatric emergency with your partner.',
      description_vi: 'Trẻ đã xấu đi. Thực hành báo cáo khẩn cấp cứu nhi khoa với đối tác.',
      stage: 'heads_together',
      order_index: 7,
      est_minutes: 20,
      objective: 'Practice paediatric emergency escalation with a partner.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Paediatric Escalation',
          title_vi: 'Kịch bản Đầy đủ — Báo cáo Khẩn Nhi khoa',
          order_index: 1,
          config: {
            script: "Nurse: Doctor, this is Nurse Anh from Paediatric Ward. I need you to come to Bed 5 immediately.\nDoctor: What is happening?\nNurse: Child, 4 years old, respiratory distress. SpO2 88 on room air, respiratory rate 45. She is working hard to breathe. I have started oxygen. I need the rapid response team NOW.\nDoctor: Any history?\nNurse: Admitted yesterday with bronchiolitis. Can you stop what you are doing and come immediately?",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Nurse: I need you to come to Bed 5 ___. Child, 4 years old, ___ distress.\nSpO2 ___ on room air, respiratory rate ___. She is ___ hard to breathe.\nI need the rapid ___ team NOW. Can you ___ what you are doing and come ___?",
            script: "Nurse: I need you to come to Bed 5 immediately. Child, 4 years old, respiratory distress.\nSpO2 88 on room air, respiratory rate 45. She is working hard to breathe.\nI need the rapid response team NOW. Can you stop what you are doing and come immediately?",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Play the nurse escalating a paediatric respiratory emergency. Nurse B: Play the doctor. Switch roles.',
            cues: [
              'State location and that it is a child',
              'Report respiratory distress, SpO2, respiratory rate',
              'Say what you have done (oxygen)',
              'Say "I need the rapid response team NOW"',
              'Say "Can you stop what you are doing and come immediately?"',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Paediatric Escalation',
          title_vi: 'Ghi âm Báo cáo Khẩn Nhi khoa của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself escalating a paediatric respiratory emergency.',
            prompt_vi: 'Ghi âm bạn báo cáo cấp cứu hô hấp nhi khoa.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself as the nurse. Include: child, age, respiratory distress, SpO2, "I need the rapid response team NOW", "Can you stop what you are doing and come immediately?" Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 8 — ASSESSMENT  (quiz → cloze → recording_submit → self_reflection)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Module Assessment — Red Flags & Self-Reflection',
      title_vi: 'Kiểm tra Module — Dấu hiệu Đỏ & Tự Phản ánh',
      description: 'A comprehensive assessment of red flag and escalation language. Finish by reflecting on what you have learned.',
      description_vi: 'Đánh giá toàn diện về ngôn ngữ dấu hiệu đỏ và báo cáo. Kết thúc bằng phản ánh những gì bạn đã học.',
      stage: 'assessment',
      order_index: 8,
      est_minutes: 25,
      objective: 'Demonstrate Module 7 red flag and escalation language.',
      steps: [
        {
          type: 'quiz',
          title: 'Module 7 Knowledge Check',
          title_vi: 'Kiểm tra Kiến thức Module 7',
          order_index: 1,
          config: {
            questions: [
              {
                id: 'm7l8q1',
                type: 'mcq',
                prompt_en: '[Part A — Vocabulary] "I am calling a code" means:',
                prompt_vi: '[Phần A — Từ vựng] "I am calling a code" có nghĩa:',
                options: [
                  { id: 'a', text: 'The nurse is making a phone call to a friend.', text_vi: 'Điều dưỡng đang gọi điện cho bạn.' },
                  { id: 'b', text: 'A life-threatening emergency is being announced — all staff should respond.', text_vi: 'Cấp cứu đe dọa tính mạng đang được thông báo — tất cả nhân viên nên phản ứng.' },
                  { id: 'c', text: 'The nurse is calling the patient.', text_vi: 'Điều dưỡng đang gọi bệnh nhân.' },
                  { id: 'd', text: 'A routine review is requested.', text_vi: 'Yêu cầu khám định kỳ.' },
                ],
                answer: 'b',
                explanation_en: 'Calling a code announces a life-threatening emergency. Code Blue typically means cardiac arrest.',
                explanation_vi: 'Gọi code thông báo cấp cứu đe dọa tính mạng. Code Blue thường có nghĩa ngừng tim.',
              },
              {
                id: 'm7l8q2',
                type: 'mcq',
                prompt_en: '[Part B — Stroke] "His symptoms suggest a stroke" — what should you report with this?',
                prompt_vi: '[Phần B — Đột quỵ] "His symptoms suggest a stroke" — bạn nên báo cáo gì với điều này?',
                options: [
                  { id: 'a', text: 'Only the phrase.', text_vi: 'Chỉ cụm từ.' },
                  { id: 'b', text: 'FAST findings (face, arms, speech), time of onset, and request urgent review.', text_vi: 'Kết quả FAST (mặt, tay, lời nói), thời gian khởi phát, và yêu cầu khám khẩn.' },
                  { id: 'c', text: 'The patient\'s address.', text_vi: 'Địa chỉ bệnh nhân.' },
                  { id: 'd', text: 'Nothing else.', text_vi: 'Không gì khác.' },
                ],
                answer: 'b',
                explanation_en: 'Include FAST findings and time of onset. Time is critical for stroke treatment.',
                explanation_vi: 'Bao gồm kết quả FAST và thời gian khởi phát. Thời gian quan trọng cho điều trị đột quỵ.',
              },
              {
                id: 'm7l8q3',
                type: 'mcq',
                prompt_en: '[Part C — Anaphylaxis] "She is showing signs of anaphylaxis" — what must you include?',
                prompt_vi: '[Phần C — Sốc phản vệ] "She is showing signs of anaphylaxis" — bạn phải bao gồm gì?',
                options: [
                  { id: 'a', text: 'Only the phrase.', text_vi: 'Chỉ cụm từ.' },
                  { id: 'b', text: 'Trigger (e.g. medication), symptoms, and whether adrenaline has been given.', text_vi: 'Tác nhân (ví dụ thuốc), triệu chứng, và đã cho adrenaline chưa.' },
                  { id: 'c', text: 'The patient\'s diet.', text_vi: 'Chế độ ăn của bệnh nhân.' },
                  { id: 'd', text: 'Nothing else.', text_vi: 'Không gì khác.' },
                ],
                answer: 'b',
                explanation_en: 'Trigger, symptoms, and treatment given help the team respond appropriately.',
                explanation_vi: 'Tác nhân, triệu chứng và điều trị đã cho giúp đội phản ứng phù hợp.',
              },
              {
                id: 'm7l8q4',
                type: 'mcq',
                prompt_en: '[Part D — Decision] When should you say "Can you stop what you are doing and come immediately?"',
                prompt_vi: '[Phần D — Quyết định] Khi nào bạn nên nói "Bạn có thể dừng việc đang làm và đến ngay không?"',
                options: [
                  { id: 'a', text: 'For any routine question.', text_vi: 'Cho bất kỳ câu hỏi thường lệ nào.' },
                  { id: 'b', text: 'When there is a true life-threatening emergency requiring immediate attendance.', text_vi: 'Khi có cấp cứu đe dọa tính mạng thực sự cần có mặt ngay.' },
                  { id: 'c', text: 'To be rude to the doctor.', text_vi: 'Để thô lỗ với bác sĩ.' },
                  { id: 'd', text: 'When the patient has a minor complaint.', text_vi: 'Khi bệnh nhân có than phiền nhỏ.' },
                ],
                answer: 'b',
                explanation_en: 'Use this phrase only for true emergencies. It is assertive and appropriate when seconds matter.',
                explanation_vi: 'Chỉ dùng cụm từ này cho cấp cứu thực sự. Nó quyết đoán và phù hợp khi mỗi giây đều quan trọng.',
              },
            ],
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Full Escalation Call',
          title_vi: 'Hoàn thành Cuộc gọi Báo cáo Khẩn Đầy đủ',
          order_index: 2,
          config: {
            cloze: "Nurse: I am ___ a code! Bed 4, Ward 3! ___ arrest!\nI need the rapid ___ team NOW. Patient is ___, no pulse.\nWe have started CPR. Can you ___ what you are doing and come ___?",
            script: "Nurse: I am calling a code! Bed 4, Ward 3! Cardiac arrest!\nI need the rapid response team NOW. Patient is unresponsive, no pulse.\nWe have started CPR. Can you stop what you are doing and come immediately?",
          },
        },
        {
          type: 'recording_submit',
          title: 'Final Assessment Recording',
          title_vi: 'Ghi âm Đánh giá Cuối cùng',
          order_index: 3,
          config: {
            prompt_en: 'Record yourself escalating a red flag emergency. Use at least three key phrases from this module.',
            prompt_vi: 'Ghi âm bạn báo cáo cấp cứu dấu hiệu đỏ. Sử dụng ít nhất ba cụm từ chính từ module này.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: '[FINAL ASSESSMENT] Choose one scenario: Code Blue, stroke, anaphylaxis, or sepsis. Record your escalation call. Include: "I am calling a code" OR "His/Her symptoms suggest..." OR "She is showing signs of anaphylaxis" OR "She meets sepsis criteria"; "I need the rapid response team NOW"; "Can you stop what you are doing and come immediately?" Aim for 40-50 seconds.',
          },
        },
        {
          type: 'self_reflection',
          title: 'Module 7 Self-Reflection',
          title_vi: 'Tự Phản ánh Module 7',
          order_index: 4,
          config: {
            prompts: [
              {
                key: 'confidence',
                type: 'slider',
                label_en: 'How confident do you feel escalating red flags in English now?',
                label_vi: 'Bạn cảm thấy tự tin báo cáo dấu hiệu đỏ bằng tiếng Anh chưa?',
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
                label_en: 'How difficult was the escalation language in this module?',
                label_vi: 'Ngôn ngữ báo cáo khẩn trong module này khó ở mức độ nào?',
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
                label_en: 'Which red flag phrase will you try to use on your next shift?',
                label_vi: 'Bạn sẽ thử dùng cụm từ dấu hiệu đỏ nào trong ca làm tiếp theo?',
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
