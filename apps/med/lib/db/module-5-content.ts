/**
 * NurseMed Emergency Nursing Communication - Module 5
 * "Communicating Patient Deterioration & Escalation Protocols"
 *
 * Module 5 builds on Modules 1-4. Learners now move from initial contact
 * and triage into the more complex territory of escalating deterioration:
 * recognising danger signs in vital signs language, using SBAR structure,
 * and communicating clearly under real clinical pressure.
 *
 * 8 Lessons following the same Heads Up → Heads Down → Heads Together → Assessment arc.
 */

import { getServiceClient } from '../supabase'

export async function seedModule5(courseId: string) {
  const db = getServiceClient()

  // ─── Create the module ──────────────────────────────────────────────────────
  const { data: module, error: moduleError } = await db
    .from('nursed_modules')
    .insert({
      course_id: courseId,
      title: 'Communicating Patient Deterioration & Escalation Protocols',
      description:
        'Learn to recognise and report patient deterioration in English. Escalate urgent concerns with confidence using SBAR, vital sign language, and clinical urgency phrases across high-pressure emergency scenarios.',
      order_index: 5,
    })
    .select()
    .single()

  if (moduleError || !module) throw new Error(moduleError?.message ?? 'Failed to create module 5')

  const moduleId = module.id

  // ─── Lesson definitions ─────────────────────────────────────────────────────

  const lessons = [
    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 1 — HEADS UP  (scenario_intro → audio_shadow → script_read → quiz)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: "Vital Signs in Crisis — What the Numbers Mean",
      description: "A patient's numbers start changing. Recognise the language nurses use when vital signs deteriorate and the first escalation phrases that matter.",
      stage: 'heads_up',
      order_index: 1,
      est_minutes: 12,
      objective: 'Identify key vital sign phrases used when a patient deteriorates.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'Emergency Ward — A Patient\'s Numbers Change',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'Medical Ward — Evening Shift',
            setting_vi: 'Khoa Nội — Ca Tối',
            context_en: 'Mr. Davies, a 58-year-old patient admitted for observation, has been stable all afternoon. At 19:30 you check his vitals and his blood pressure has dropped sharply, his heart rate is elevated, and he looks pale and sweaty. You need to communicate this clearly to the charge nurse and prepare to escalate.',
            context_vi: 'Ông Davies, bệnh nhân 58 tuổi nhập viện để theo dõi, đã ổn định cả chiều. Lúc 19:30 bạn kiểm tra sinh hiệu và phát hiện huyết áp giảm mạnh, nhịp tim tăng cao, da nhợt và đổ mồ hôi. Bạn cần truyền đạt điều này rõ ràng với điều dưỡng trưởng và chuẩn bị báo cáo.',
            key_phrases: [
              { en: 'His blood pressure has dropped to 85 over 50.', vi: 'Huyết áp của ông ấy đã giảm xuống 85/50.' },
              { en: 'His heart rate is up to 115.', vi: 'Nhịp tim của ông ấy tăng lên 115.' },
              { en: 'He looks pale and diaphoretic.', vi: 'Ông ấy trông nhợt nhạt và đổ mồ hôi.' },
              { en: 'I am concerned about this patient.', vi: 'Tôi lo ngại về bệnh nhân này.' },
              { en: 'I think we need to escalate.', vi: 'Tôi nghĩ chúng ta cần báo cáo khẩn.' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec ambient audio — busy medical ward evening, monitor beeps, distant call bell. No dialogue. Mood: urgent and clinical.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen & Repeat: Vital Sign Escalation Language',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: Charge Nurse, I need to report a concern about Mr. Davies in Bed 4.\nCharge Nurse: Go ahead.\nNurse: His blood pressure has dropped to 85 over 50. His heart rate is up to 115. He is pale and diaphoretic.\nCharge Nurse: How long has this been going on?\nNurse: I noticed the change about ten minutes ago. He is still conscious but looks very unwell.\nCharge Nurse: Okay. I am coming now. Have you called the doctor?\nNurse: Not yet. I wanted to inform you first.\nCharge Nurse: Good. I will call. Stay with him.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse (female, Vietnamese accent OK, calm and factual tone), Charge Nurse (male, experienced, authoritative). Clinical ward background sounds. Duration: 35-40 sec. Speed: 0.8x slow. This models the Situation component of SBAR reporting.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Escalation Dialogue',
          order_index: 3,
          config: {
            script: "Nurse: Charge Nurse, I need to report a concern about Mr. Davies in Bed 4.\nCharge Nurse: Go ahead.\nNurse: His blood pressure has dropped to 85 over 50. His heart rate is up to 115.\nCharge Nurse: How long ago did this change?\nNurse: About ten minutes ago. He is still conscious but looks very unwell.\nCharge Nurse: I am coming now. Stay with him.",
          },
        },
        {
          type: 'quiz',
          title: 'Check Your Understanding',
          order_index: 4,
          config: {
            questions: [
              {
                id: 'm5l1q1',
                type: 'mcq',
                prompt_en: 'What does "diaphoretic" mean in a clinical context?',
                prompt_vi: '"Diaphoretic" có nghĩa là gì trong bối cảnh lâm sàng?',
                options: [
                  { id: 'a', text: 'Very pale', text_vi: 'Rất nhợt nhạt' },
                  { id: 'b', text: 'Sweating heavily', text_vi: 'Đổ mồ hôi nhiều' },
                  { id: 'c', text: 'Breathing fast', text_vi: 'Thở nhanh' },
                  { id: 'd', text: 'Confused', text_vi: 'Lú lẫn' },
                ],
                answer: 'b',
                explanation_en: 'Diaphoretic means excessively sweaty — a key clinical sign in deteriorating patients.',
                explanation_vi: 'Diaphoretic có nghĩa là đổ mồ hôi nhiều — dấu hiệu lâm sàng quan trọng ở bệnh nhân đang xấu đi.',
              },
              {
                id: 'm5l1q2',
                type: 'mcq',
                prompt_en: 'What is the FIRST thing the nurse does before calling the doctor?',
                prompt_vi: 'Điều ĐẦU TIÊN điều dưỡng làm trước khi gọi bác sĩ là gì?',
                options: [
                  { id: 'a', text: 'Gives medication to the patient.', text_vi: 'Cho bệnh nhân dùng thuốc.' },
                  { id: 'b', text: 'Informs the charge nurse.', text_vi: 'Báo cáo điều dưỡng trưởng.' },
                  { id: 'c', text: 'Documents the vitals in the chart.', text_vi: 'Ghi sinh hiệu vào hồ sơ.' },
                  { id: 'd', text: 'Asks the family to wait outside.', text_vi: 'Yêu cầu người nhà ra ngoài.' },
                ],
                answer: 'b',
                explanation_en: 'In most ward protocols, informing the charge nurse first ensures a coordinated response.',
                explanation_vi: 'Trong hầu hết quy trình khoa, báo cáo điều dưỡng trưởng trước đảm bảo phản ứng phối hợp.',
              },
              {
                id: 'm5l1q3',
                type: 'mcq',
                prompt_en: 'Which phrase signals urgency without causing panic?',
                prompt_vi: 'Cụm từ nào báo hiệu sự khẩn cấp mà không gây hoảng loạn?',
                options: [
                  { id: 'a', text: 'He is dying! Come now!', text_vi: 'Ông ấy sắp chết! Đến ngay!' },
                  { id: 'b', text: 'I think we need to escalate.', text_vi: 'Tôi nghĩ chúng ta cần báo cáo khẩn.' },
                  { id: 'c', text: 'Something might be wrong.', text_vi: 'Có thể có gì đó không ổn.' },
                  { id: 'd', text: 'I am not sure about the numbers.', text_vi: 'Tôi không chắc về các con số.' },
                ],
                answer: 'b',
                explanation_en: '"I think we need to escalate" is clear, professional, and prompts action without causing unnecessary fear.',
                explanation_vi: '"Tôi nghĩ chúng ta cần báo cáo khẩn" rõ ràng, chuyên nghiệp và thúc đẩy hành động mà không gây sợ hãi.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 2 — HEADS UP  (audio_shadow → script_read → quiz)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Key Phrases in Action — Red Flags & Urgency',
      description: 'A new scenario. Practice the exact language used to describe clinical red flags and escalate concerns assertively.',
      stage: 'heads_up',
      order_index: 2,
      est_minutes: 12,
      objective: 'Use red-flag phrases and escalation language confidently.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Reporting a Red Flag to the Doctor',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: Doctor, I am calling about Ms. Tran in Room 6. I am concerned.\nDoctor: What is the issue?\nNurse: Her oxygen saturation has dropped to 88 percent on room air. Her respiratory rate is 28. She is struggling to breathe.\nDoctor: Is she on oxygen now?\nNurse: I have just started her on 4 litres. She is more comfortable but still distressed.\nDoctor: I am on my way. Keep monitoring and call the emergency team if she drops below 85.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse (clear, factual, slightly urgent), Doctor (decisive, professional). Phone call context — both slight phone filter. Duration: 35-40 sec. Slow speed 0.8x. This models an urgent phone escalation.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the SBAR Phone Call',
          order_index: 2,
          config: {
            script: "Nurse: Doctor, I am calling about Ms. Tran in Room 6. I am concerned.\nDoctor: What is the issue?\nNurse: Her oxygen saturation has dropped to 88 percent. Her respiratory rate is 28. She is struggling to breathe.\nDoctor: Is she on oxygen now?\nNurse: Yes, I have started 4 litres. She is more comfortable.\nDoctor: I am on my way.",
          },
        },
        {
          type: 'quiz',
          title: 'Recognition Check — Red Flag Language',
          order_index: 3,
          config: {
            questions: [
              {
                id: 'm5l2q1',
                type: 'mcq',
                prompt_en: 'What does SpO2 88% on room air indicate?',
                prompt_vi: 'SpO2 88% khi thở không khí phòng cho biết điều gì?',
                options: [
                  { id: 'a', text: 'The patient is breathing well.', text_vi: 'Bệnh nhân thở tốt.' },
                  { id: 'b', text: 'Dangerously low oxygen levels — needs urgent action.', text_vi: 'Mức oxy nguy hiểm thấp — cần xử lý khẩn.' },
                  { id: 'c', text: 'Normal for older patients.', text_vi: 'Bình thường với bệnh nhân cao tuổi.' },
                  { id: 'd', text: 'The monitor may be wrong.', text_vi: 'Máy đo có thể sai.' },
                ],
                answer: 'b',
                explanation_en: 'SpO2 below 90% is a medical emergency — escalate immediately.',
                explanation_vi: 'SpO2 dưới 90% là cấp cứu y tế — cần báo cáo ngay lập tức.',
              },
              {
                id: 'm5l2q2',
                type: 'mcq',
                prompt_en: 'Which phrase accurately reports a breathing rate problem?',
                prompt_vi: 'Cụm từ nào mô tả chính xác vấn đề về nhịp thở?',
                options: [
                  { id: 'a', text: 'She is breathing a bit fast.', text_vi: 'Cô ấy thở hơi nhanh.' },
                  { id: 'b', text: 'Her respiratory rate is 28.', text_vi: 'Nhịp thở của cô ấy là 28.' },
                  { id: 'c', text: 'I think her breathing changed.', text_vi: 'Tôi nghĩ hơi thở của cô ấy thay đổi.' },
                  { id: 'd', text: 'She does not look well.', text_vi: 'Cô ấy trông không khỏe.' },
                ],
                answer: 'b',
                explanation_en: 'Use precise numbers when escalating — "Her respiratory rate is 28" is clinical and actionable.',
                explanation_vi: 'Dùng số liệu cụ thể khi báo cáo — "Nhịp thở của cô ấy là 28" mang tính lâm sàng và có thể hành động ngay.',
              },
              {
                id: 'm5l2q3',
                type: 'mcq',
                prompt_en: 'What does "I am concerned" communicate to a doctor?',
                prompt_vi: '"I am concerned" truyền đạt điều gì với bác sĩ?',
                options: [
                  { id: 'a', text: 'The nurse is not confident.', text_vi: 'Điều dưỡng không tự tin.' },
                  { id: 'b', text: 'A formal signal that something needs attention — not a complaint.', text_vi: 'Tín hiệu chính thức rằng có điều gì đó cần chú ý — không phải phàn nàn.' },
                  { id: 'c', text: 'The patient is very sick and dying.', text_vi: 'Bệnh nhân rất nặng và sắp chết.' },
                  { id: 'd', text: 'The nurse is scared and needs help.', text_vi: 'Điều dưỡng sợ hãi và cần giúp đỡ.' },
                ],
                answer: 'b',
                explanation_en: '"I am concerned" is a professional clinical phrase used internationally to signal a need for review — learn it, use it.',
                explanation_vi: '"I am concerned" là cụm từ lâm sàng chuyên nghiệp dùng quốc tế để báo hiệu cần xem xét — hãy học và sử dụng.',
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
      title: 'Understanding the Situation — SBAR in Practice',
      description: 'Listen to a full SBAR escalation call. Then complete a cloze exercise using the exact language from the call.',
      stage: 'heads_down',
      order_index: 3,
      est_minutes: 15,
      objective: 'Identify and reproduce the four parts of an SBAR escalation.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: A Full SBAR Report',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'normal',
            transcript: "Nurse: Doctor, this is Nurse Lan from Ward 3. I am calling about Mr. Ahmed in Bed 7.\nDoctor: Yes, go ahead.\nNurse: The situation is that he has become suddenly confused and unresponsive to my questions.\nDoctor: What is his background?\nNurse: He is 67 years old, admitted yesterday with a urinary tract infection, no previous confusion noted.\nDoctor: What is your assessment?\nNurse: His temperature is 39.2, blood pressure 95 over 60, and his GCS has dropped to 12. I am worried about sepsis.\nDoctor: And your recommendation?\nNurse: I think he needs an urgent review and sepsis bloods. Could you come now?\nDoctor: Yes. I am coming immediately.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse (calm, structured, SBAR format), Doctor (listening and responsive). Clear phone call scenario. Duration: 40-45 sec. Normal speed. Label each SBAR section clearly in nurse speech through pacing and tone.',
          },
        },
        {
          type: 'cloze',
          title: 'Fill in the SBAR Report',
          order_index: 2,
          config: {
            cloze: "Nurse: Doctor, this is Nurse Lan. I am calling about Mr. Ahmed in Bed 7.\nThe ___ is that he has become suddenly ___ and unresponsive.\nHe is 67 years old, admitted with a urinary tract ___.\nHis temperature is ___, blood pressure ___ over 60, and his GCS has dropped to ___.\nI am worried about ___. I think he needs an urgent ___.",
            script: "Nurse: Doctor, this is Nurse Lan. I am calling about Mr. Ahmed in Bed 7.\nThe situation is that he has become suddenly confused and unresponsive.\nHe is 67 years old, admitted with a urinary tract infection.\nHis temperature is 39.2, blood pressure 95 over 60, and his GCS has dropped to 12.\nI am worried about sepsis. I think he needs an urgent review.",
          },
        },
        {
          type: 'quiz',
          title: 'SBAR Structure Check',
          order_index: 3,
          config: {
            questions: [
              {
                id: 'm5l3q1',
                type: 'mcq',
                prompt_en: 'What does SBAR stand for?',
                prompt_vi: 'SBAR là viết tắt của gì?',
                options: [
                  { id: 'a', text: 'Situation, Background, Assessment, Recommendation', text_vi: 'Tình huống, Lịch sử, Đánh giá, Khuyến nghị' },
                  { id: 'b', text: 'Status, Blood, Airway, Response', text_vi: 'Trạng thái, Máu, Đường thở, Phản ứng' },
                  { id: 'c', text: 'Symptom, Brief, Action, Review', text_vi: 'Triệu chứng, Tóm tắt, Hành động, Xem xét' },
                  { id: 'd', text: 'Safe, Brief, Assess, Report', text_vi: 'An toàn, Tóm tắt, Đánh giá, Báo cáo' },
                ],
                answer: 'a',
                explanation_en: 'SBAR: Situation (what is happening), Background (context), Assessment (what you think), Recommendation (what you need).',
                explanation_vi: 'SBAR: Tình huống (điều đang xảy ra), Lịch sử (bối cảnh), Đánh giá (nhận định của bạn), Khuyến nghị (bạn cần gì).',
              },
              {
                id: 'm5l3q2',
                type: 'mcq',
                prompt_en: 'In the SBAR call, which component is "He is 67, admitted with a UTI"?',
                prompt_vi: 'Trong cuộc gọi SBAR, thành phần nào là "Ông ấy 67 tuổi, nhập viện vì nhiễm trùng tiểu"?',
                options: [
                  { id: 'a', text: 'Situation', text_vi: 'Tình huống' },
                  { id: 'b', text: 'Background', text_vi: 'Lịch sử' },
                  { id: 'c', text: 'Assessment', text_vi: 'Đánh giá' },
                  { id: 'd', text: 'Recommendation', text_vi: 'Khuyến nghị' },
                ],
                answer: 'b',
                explanation_en: 'Background provides the clinical history — who the patient is and why they are in hospital.',
                explanation_vi: 'Lịch sử cung cấp bối cảnh lâm sàng — bệnh nhân là ai và tại sao họ nhập viện.',
              },
              {
                id: 'm5l3q3',
                type: 'mcq',
                prompt_en: 'What phrase does the nurse use for the Recommendation step?',
                prompt_vi: 'Điều dưỡng dùng cụm từ nào cho bước Khuyến nghị?',
                options: [
                  { id: 'a', text: 'I am worried about sepsis.', text_vi: 'Tôi lo ngại về nhiễm trùng huyết.' },
                  { id: 'b', text: 'I think he needs an urgent review.', text_vi: 'Tôi nghĩ ông ấy cần đánh giá khẩn.' },
                  { id: 'c', text: 'His temperature is 39.2.', text_vi: 'Nhiệt độ của ông ấy là 39.2.' },
                  { id: 'd', text: 'He is suddenly confused.', text_vi: 'Ông ấy đột ngột lú lẫn.' },
                ],
                answer: 'b',
                explanation_en: '"I think he needs an urgent review" is a clear Recommendation — it states exactly what action is needed.',
                explanation_vi: '"Tôi nghĩ ông ấy cần đánh giá khẩn" là Khuyến nghị rõ ràng — nêu chính xác hành động cần thiết.',
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
      title: 'A Second Scenario — Respiratory Deterioration',
      description: 'A new context: a post-surgery patient developing breathing difficulties. Same language skills, different clinical picture.',
      stage: 'heads_down',
      order_index: 4,
      est_minutes: 15,
      objective: 'Apply escalation language to a respiratory deterioration scenario.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'Post-Op Ward — Breathing Becomes Difficult',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'Surgical Recovery Ward — Night Shift',
            setting_vi: 'Khoa Hồi Phục Phẫu Thuật — Ca Đêm',
            context_en: 'Mrs. Park, 52 years old, returned from abdominal surgery 4 hours ago. You do your routine check and find her breathing is laboured, her respiratory rate is 24, and her SpO2 is 91%. She says her chest feels tight. You need to assess and escalate immediately.',
            context_vi: 'Bà Park, 52 tuổi, trở về từ phẫu thuật bụng 4 giờ trước. Bạn kiểm tra định kỳ và thấy bà thở khó, nhịp thở 24, SpO2 91%. Bà nói ngực bà cảm thấy tức. Bạn cần đánh giá và báo cáo ngay.',
            key_phrases: [
              { en: 'Her breathing is laboured.', vi: 'Hơi thở của bà ấy khó khăn.' },
              { en: 'Her chest feels tight.', vi: 'Ngực bà ấy cảm thấy tức.' },
              { en: 'Her SpO2 is 91 percent.', vi: 'SpO2 của bà ấy là 91 phần trăm.' },
              { en: 'This is a post-operative patient.', vi: 'Đây là bệnh nhân hậu phẫu.' },
              { en: 'I am starting oxygen now.', vi: 'Tôi đang bắt đầu thở oxy ngay.' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec post-op ward ambient — quiet night ward, soft monitor alarms. No dialogue. Mood: quiet but tense.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Escalates Mrs. Park',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: Doctor Singh, this is Nurse Mai from the surgical ward. I need to report a concern.\nDoctor: Yes?\nNurse: Mrs. Park in Bed 2 is having difficulty breathing. Her respiratory rate is 24 and her SpO2 is 91 percent. She reports chest tightness.\nDoctor: Is she on oxygen?\nNurse: I have just started her on 2 litres via nasal cannula.\nDoctor: Has she had any chest pain?\nNurse: No chest pain, but she looks anxious and her breathing is laboured.\nDoctor: Okay. Get an ECG and I will review her in five minutes.",
            _instructions: 'AUDIO PRODUCER: Phone call escalation. Nurse: calm, factual, confident. Doctor: efficient, directive. Post-op context. Duration: 35-40 sec. Slow speed 0.8x. Demonstrates full SBAR without labelling it.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Escalation Call',
          order_index: 3,
          config: {
            script: "Nurse: Doctor Singh, this is Nurse Mai from the surgical ward.\nI need to report a concern about Mrs. Park in Bed 2.\nHer respiratory rate is 24 and her SpO2 is 91 percent.\nShe reports chest tightness.\nDoctor: Is she on oxygen?\nNurse: Yes, I have started 2 litres via nasal cannula.\nDoctor: Okay. Get an ECG. I will be there in five minutes.",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Escalation Call',
          order_index: 4,
          config: {
            cloze: "Nurse: Doctor Singh, this is Nurse Mai. I need to report a ___.\nMrs. Park in Bed 2 is having difficulty ___.\nHer ___ rate is 24 and her SpO2 is ___ percent.\nShe reports chest ___.\nDoctor: Is she on oxygen?\nNurse: Yes, I have started 2 litres via ___ cannula.",
            script: "Nurse: Doctor Singh, this is Nurse Mai. I need to report a concern.\nMrs. Park in Bed 2 is having difficulty breathing.\nHer respiratory rate is 24 and her SpO2 is 91 percent.\nShe reports chest tightness.\nDoctor: Is she on oxygen?\nNurse: Yes, I have started 2 litres via nasal cannula.",
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 5 — HEADS DOWN  (audio_shadow → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Your Turn to Speak — Open Deterioration Scenario',
      description: 'Now you lead. Listen to a deteriorating patient scenario, then speak the SBAR escalation call yourself — first with support, then from cue cards only.',
      stage: 'heads_down',
      order_index: 5,
      est_minutes: 18,
      objective: 'Independently deliver an SBAR escalation call for a deteriorating patient.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Patient with Altered Consciousness',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: Dr. Lee, this is Nurse Hoa from Ward 5. I am concerned about Mr. Nguyen in Bed 10.\nDoctor: What is happening?\nNurse: He was alert this morning. Now he is very drowsy and not responding normally to my questions.\nDoctor: What are his observations?\nNurse: Temperature 38.8, heart rate 112, blood pressure 100 over 65, GCS 13.\nDoctor: Has he had any falls?\nNurse: No falls, but he looks very unwell. I think he needs to be seen urgently.\nDoctor: I will come right now.",
            _instructions: 'AUDIO PRODUCER: Nurse (female, confident but slightly anxious — this is a new development), Doctor (efficient, reassuring). Ward phone call. Duration: 35-40 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'cloze',
          title: 'Build the SBAR Call',
          order_index: 2,
          config: {
            cloze: "Nurse: Dr. Lee, this is Nurse Hoa from Ward 5. I am ___ about Mr. Nguyen in Bed 10.\nHe was ___ this morning. Now he is very drowsy and not ___ normally.\nTemperature 38.8, heart rate ___, blood pressure 100 over 65, GCS ___.\nI think he needs to be seen ___.",
            script: "Nurse: Dr. Lee, this is Nurse Hoa from Ward 5. I am concerned about Mr. Nguyen in Bed 10.\nHe was alert this morning. Now he is very drowsy and not responding normally.\nTemperature 38.8, heart rate 112, blood pressure 100 over 65, GCS 13.\nI think he needs to be seen urgently.",
          },
        },
        {
          type: 'no_script',
          title: 'Speak It — No Script',
          order_index: 3,
          config: {
            context: 'You are calling to escalate Mr. Nguyen, a patient who has become drowsy and unwell. Use the SBAR framework from memory.',
            cues: [
              'Identify yourself and the patient (name, bed)',
              'State the situation — what has changed',
              'Give background — was he alert before?',
              'Give numbers — temperature, heart rate, GCS',
              'State your assessment — what do you think?',
              'Make your recommendation — what do you need?',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your SBAR Escalation',
          order_index: 4,
          config: {
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself as the nurse escalating Mr. Nguyen\'s deterioration. Use the SBAR structure: Situation → Background → Assessment → Recommendation. Try to include at least one vital sign number and the phrase "I am concerned." Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 6 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Round 1: Structured SBAR Handover',
      description: 'Work with a partner. One plays the escalating nurse, one plays the doctor receiving the call. Switch roles and practice across three rounds.',
      stage: 'heads_together',
      order_index: 6,
      est_minutes: 20,
      objective: 'Practice a full SBAR handover with a partner using structured support.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Nurse to Doctor: Cardiac Concern',
          order_index: 1,
          config: {
            script: "Nurse: Dr. An, this is Nurse Binh from Cardiology. I am calling about Mr. Foster in Room 12.\nDoctor: Go ahead.\nNurse: The situation is that Mr. Foster has developed chest pain in the last 20 minutes.\nDoctor: Any radiation?\nNurse: Yes, he says the pain goes down his left arm. His ECG shows ST changes.\nDoctor: What are his vitals?\nNurse: Blood pressure 140 over 90, heart rate 98, and he is sweating.\nDoctor: This sounds like an ACS. Get cardiology and prep for the cath lab.\nNurse: Understood. I will call cardiology now. Should I give aspirin?\nDoctor: Yes, 300 milligrams. I am coming.",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          order_index: 2,
          config: {
            cloze: "Nurse: Dr. An, this is Nurse Binh. I am calling about Mr. Foster in Room 12.\nHe has developed chest ___ in the last 20 minutes.\nThe pain goes down his ___ arm. His ECG shows ST ___.\nBlood pressure 140 over 90, heart rate ___, and he is sweating.\nDoctor: Get ___ and prep for the cath lab.\nNurse: Understood. Should I give ___?\nDoctor: Yes, 300 milligrams.",
            script: "Nurse: Dr. An, this is Nurse Binh. I am calling about Mr. Foster in Room 12.\nHe has developed chest pain in the last 20 minutes.\nThe pain goes down his left arm. His ECG shows ST changes.\nBlood pressure 140 over 90, heart rate 98, and he is sweating.\nDoctor: Get cardiology and prep for the cath lab.\nNurse: Understood. Should I give aspirin?\nDoctor: Yes, 300 milligrams.",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          order_index: 3,
          config: {
            context: 'Nurse A: Play the nurse escalating the cardiac concern. Nurse B: Play the doctor receiving the call. Switch roles after one round.',
            cues: [
              'Identify yourself and call the patient by name',
              'State the chest pain situation clearly',
              'Mention the ECG finding (ST changes)',
              'Report the vital sign numbers',
              'Wait for the doctor\'s response',
              'Ask about aspirin and confirm next steps',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Submit Your Best Round',
          order_index: 4,
          config: {
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'PAIR PRACTICE: Complete all three rounds with your partner. Submit ONE recording per person — your best performance from Round 3 (cue cards only). Each recording should be 30-45 seconds. Nurse role only — do not record the doctor\'s responses.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 7 — HEADS TOGETHER  (no_script → recording_submit → mission)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Round 2: Responding to Family Anxiety',
      description: 'A new challenge: the family is at the bedside and asking why their relative has deteriorated. Practice communicating clinical urgency while keeping the family calm.',
      stage: 'heads_together',
      order_index: 7,
      est_minutes: 20,
      objective: 'Communicate patient deterioration clearly to an anxious family member.',
      steps: [
        {
          type: 'no_script',
          title: 'Scenario — Family at the Bedside',
          order_index: 1,
          config: {
            context: 'You are the nurse. Mrs. Park\'s daughter has just arrived and is very upset. She is asking why her mother\'s condition has changed and why the doctor has been called. You need to communicate clearly, keep her calm, and explain what is happening without causing panic.',
            cues: [
              'Greet the family member and introduce yourself',
              'Acknowledge their concern — "I understand you are worried"',
              'Explain simply what has changed in the patient\'s condition',
              'Tell them what you have already done (oxygen, doctor called)',
              'Reassure them that the team is responding',
              'Ask them to wait nearby and update them as soon as you know more',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Family Communication',
          order_index: 2,
          config: {
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'You are the nurse speaking to the patient\'s daughter who is upset and confused. Speak naturally as if she is in front of you. Your response should: greet her, acknowledge her worry, explain the situation simply, and reassure her. Aim for 30-45 seconds.',
          },
        },
        {
          type: 'mission',
          title: 'Real-World Mission',
          order_index: 3,
          config: {
            mission_en: 'Before your next clinical shift, write out a short SBAR template on a card or phone note: Situation — Background — Assessment — Recommendation. Next time you observe a nurse escalate a concern (in English or Vietnamese), notice: Did they follow this structure? What phrases did they use? Bring one example to your next session.',
            mission_vi: 'Trước ca lâm sàng tiếp theo, hãy viết ra một mẫu SBAR ngắn trên giấy ghi chú hoặc điện thoại: Tình huống — Lịch sử — Đánh giá — Khuyến nghị. Lần tới khi quan sát một điều dưỡng báo cáo khẩn (bằng tiếng Anh hoặc tiếng Việt), hãy chú ý: Họ có tuân theo cấu trúc này không? Họ đã dùng cụm từ nào? Mang một ví dụ đến buổi học tiếp theo.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 8 — ASSESSMENT  (quiz → cloze → recording_submit → self_reflection)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Module Assessment — Mixed Input & Self-Reflection',
      description: 'A comprehensive assessment combining clinical decision-making, language recall, and your own escalation recording. Finish by reflecting on what you have learned.',
      stage: 'assessment',
      order_index: 8,
      est_minutes: 25,
      objective: 'Demonstrate Module 5 escalation language across all four SBAR components.',
      steps: [
        {
          type: 'quiz',
          title: 'Module 5 Knowledge Check',
          order_index: 1,
          config: {
            questions: [
              {
                id: 'm5l8q1',
                type: 'mcq',
                prompt_en: '[Part A — Vocabulary] A patient\'s GCS has dropped from 15 to 12. What does this indicate?',
                prompt_vi: '[Phần A — Từ vựng] GCS của bệnh nhân giảm từ 15 xuống 12. Điều này cho biết gì?',
                options: [
                  { id: 'a', text: 'They are sleeping more than usual.', text_vi: 'Họ ngủ nhiều hơn bình thường.' },
                  { id: 'b', text: 'Their level of consciousness has decreased — urgent escalation needed.', text_vi: 'Mức độ ý thức giảm — cần báo cáo khẩn.' },
                  { id: 'c', text: 'They are in less pain than before.', text_vi: 'Họ đau ít hơn trước.' },
                  { id: 'd', text: 'Their vital signs are improving.', text_vi: 'Sinh hiệu đang cải thiện.' },
                ],
                answer: 'b',
                explanation_en: 'GCS 12 (dropped from 15) is a significant fall in consciousness level — always escalate any GCS change.',
                explanation_vi: 'GCS 12 (giảm từ 15) là sự giảm đáng kể về mức độ ý thức — luôn báo cáo bất kỳ thay đổi GCS nào.',
              },
              {
                id: 'm5l8q2',
                type: 'mcq',
                prompt_en: '[Part B — SBAR] You say "I think she needs urgent bloods and a review." Which SBAR component is this?',
                prompt_vi: '[Phần B — SBAR] Bạn nói "Tôi nghĩ cô ấy cần xét nghiệm khẩn và được khám." Đây là thành phần SBAR nào?',
                options: [
                  { id: 'a', text: 'Situation', text_vi: 'Tình huống' },
                  { id: 'b', text: 'Background', text_vi: 'Lịch sử' },
                  { id: 'c', text: 'Assessment', text_vi: 'Đánh giá' },
                  { id: 'd', text: 'Recommendation', text_vi: 'Khuyến nghị' },
                ],
                answer: 'd',
                explanation_en: 'Recommending an action ("urgent bloods and review") is the R in SBAR — the most important part for getting the doctor to act.',
                explanation_vi: 'Khuyến nghị hành động ("xét nghiệm khẩn và được khám") là R trong SBAR — phần quan trọng nhất để bác sĩ hành động.',
              },
              {
                id: 'm5l8q3',
                type: 'mcq',
                prompt_en: '[Part C — Clinical Language] A patient has "laboured breathing." What does this mean?',
                prompt_vi: '[Phần C — Ngôn ngữ lâm sàng] Bệnh nhân "thở khó khăn" (laboured breathing). Điều này có nghĩa là gì?',
                options: [
                  { id: 'a', text: 'Breathing normally but slowly.', text_vi: 'Thở bình thường nhưng chậm.' },
                  { id: 'b', text: 'Breathing that requires obvious effort — a sign of respiratory distress.', text_vi: 'Thở đòi hỏi nỗ lực rõ ràng — dấu hiệu suy hô hấp.' },
                  { id: 'c', text: 'Breathing that is very fast.', text_vi: 'Thở rất nhanh.' },
                  { id: 'd', text: 'Breathing that is stopped temporarily.', text_vi: 'Thở tạm thời dừng lại.' },
                ],
                answer: 'b',
                explanation_en: '"Laboured breathing" describes visible effort in breathing — an important clinical red flag in deteriorating patients.',
                explanation_vi: '"Laboured breathing" mô tả hơi thở đòi hỏi nỗ lực rõ ràng — dấu hiệu đỏ lâm sàng quan trọng ở bệnh nhân xấu đi.',
              },
              {
                id: 'm5l8q4',
                type: 'mcq',
                prompt_en: '[Part D — Decision] A family member demands to know why the doctor has been called. You should:',
                prompt_vi: '[Phần D — Quyết định] Người nhà bệnh nhân yêu cầu biết tại sao bác sĩ được gọi. Bạn nên:',
                options: [
                  { id: 'a', text: 'Tell them everything including the diagnosis.', text_vi: 'Nói với họ mọi thứ kể cả chẩn đoán.' },
                  { id: 'b', text: 'Say "I cannot tell you anything."', text_vi: 'Nói "Tôi không thể nói gì với bạn."' },
                  { id: 'c', text: 'Acknowledge their concern, explain simply what you observed, and confirm the team is responding.', text_vi: 'Thừa nhận mối lo ngại, giải thích đơn giản những gì bạn quan sát, và xác nhận đội ngũ đang phản ứng.' },
                  { id: 'd', text: 'Ask them to wait outside and say nothing more.', text_vi: 'Yêu cầu họ ra ngoài và không nói thêm gì.' },
                ],
                answer: 'c',
                explanation_en: 'Acknowledge → explain simply → reassure. This is the correct family communication approach for clinical changes.',
                explanation_vi: 'Thừa nhận → giải thích đơn giản → trấn an. Đây là cách giao tiếp đúng với gia đình khi có thay đổi lâm sàng.',
              },
            ],
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Full SBAR Report',
          order_index: 2,
          config: {
            cloze: "Nurse: Doctor, this is Nurse [Name] from Ward 2. I am ___ about Mr. Costa in Bed 6.\nThe ___ is that he has become suddenly confused and is not ___ to questions.\nHe is 71, admitted two days ago with pneumonia.\nHis temperature is 38.9, blood pressure 90 over 55, and his GCS has ___ to 11.\nI am worried this could be ___. I think he needs an urgent ___ and sepsis protocol.",
            script: "Nurse: Doctor, this is Nurse [Name] from Ward 2. I am concerned about Mr. Costa in Bed 6.\nThe situation is that he has become suddenly confused and is not responding to questions.\nHe is 71, admitted two days ago with pneumonia.\nHis temperature is 38.9, blood pressure 90 over 55, and his GCS has dropped to 11.\nI am worried this could be sepsis. I think he needs an urgent review and sepsis protocol.",
          },
        },
        {
          type: 'recording_submit',
          title: 'Final Assessment Recording',
          order_index: 3,
          config: {
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: '[FINAL ASSESSMENT] You are Nurse [Your Name] from Ward 2. Call the doctor to escalate Mr. Costa\'s deterioration. Use the full SBAR structure. Include: patient name and location, what has changed, his background, at least two vital sign numbers, your clinical concern, and what you need. Aim for 40-50 seconds. This is your assessed recording for Module 5.',
          },
        },
        {
          type: 'self_reflection',
          title: 'Module 5 Self-Reflection',
          order_index: 4,
          config: {
            prompts: [
              {
                key: 'confidence',
                type: 'slider',
                label_en: 'How confident do you feel using SBAR to escalate a concern in English now?',
                label_vi: 'Bạn cảm thấy tự tin sử dụng SBAR để báo cáo khẩn bằng tiếng Anh chưa?',
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
                label_en: 'How difficult was the clinical language in this module?',
                label_vi: 'Ngôn ngữ lâm sàng trong module này khó ở mức độ nào?',
              },
              {
                key: 'pair_helped',
                type: 'slider',
                label_en: 'Did the pair practice (Lessons 6 and 7) help you feel more prepared to escalate?',
                label_vi: 'Luyện tập cặp đôi (Bài 6 và 7) có giúp bạn cảm thấy sẵn sàng hơn để báo cáo không?',
              },
              {
                key: 'open_feedback',
                type: 'text',
                label_en: 'In your next shift, which situation from this module would you most likely face? What phrase will you try to use?',
                label_vi: 'Trong ca làm tiếp theo, tình huống nào từ module này bạn có khả năng gặp nhất? Bạn sẽ thử dùng cụm từ nào?',
              },
            ],
          },
        },
      ],
    },
  ]

  // ─── Insert lessons and steps ────────────────────────────────────────────────

  for (const lessonData of lessons) {
    const { steps, ...lessonFields } = lessonData

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
        order_index: stepData.order_index,
        config: stepData.config,
      })

      if (stepError) throw new Error(stepError.message ?? `Failed to create step in ${lessonFields.title}`)
    }
  }

  return module
}
