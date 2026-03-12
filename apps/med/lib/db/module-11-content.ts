/**
 * NurseMed Emergency Nursing Communication - Module 11
 * "Trauma & Acute Injuries"
 *
 * Module 11 teaches trauma bay communication — MVA patients, fall injuries,
 * burns, head trauma. Rapid assessment language (ABCDE), pain assessment,
 * trauma team communication.
 *
 * 8 Lessons: Heads Up → Heads Down → Heads Together → Assessment
 * Module shell ALREADY EXISTS — do NOT insert into nursed_modules.
 */

import { getServiceClient } from '../supabase'

export async function seedModule11(moduleId: string) {
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
      title: 'Road Traffic Accident Victim in A&E',
      title_vi: 'Nạn nhân Tai nạn Giao thông tại Cấp cứu',
      description: 'A patient has arrived after a road accident. Learn the language for trauma assessment and team handover.',
      description_vi: 'Bệnh nhân đến sau tai nạn giao thông. Học ngôn ngữ đánh giá chấn thương và bàn giao đội.',
      stage: 'heads_up',
      order_index: 1,
      est_minutes: 12,
      objective: 'Identify key trauma assessment and handover phrases.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'A&E — RTA Victim Arrives',
          title_vi: 'Cấp cứu — Nạn nhân Tai nạn Giao thông Đến',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'A&E Trauma Bay — Ambulance Arrival',
            setting_vi: 'Khu Chấn thương Cấp cứu — Xe cấp cứu Đến',
            context_en: 'Mr. Davies, 45, has been brought in by ambulance after a road traffic accident. He is conscious but confused. The paramedics report GCS 10 at scene. You need to receive the handover and begin the trauma assessment. The team is checking airway first.',
            context_vi: 'Ông Davies, 45 tuổi, được đưa đến bằng xe cấp cứu sau tai nạn giao thông. Ông tỉnh nhưng lú lẫn. Nhân viên cấp cứu báo GCS 10 tại hiện trường. Bạn cần nhận bàn giao và bắt đầu đánh giá chấn thương. Đội đang kiểm tra đường thở trước.',
            key_phrases: [
              { en: 'Can you tell me where it hurts?', vi: 'Bạn có thể nói cho tôi biết đau ở đâu không?' },
              { en: 'On a scale of 0 to 10, how is your pain?', vi: 'Trên thang 0 đến 10, cơn đau của bạn thế nào?' },
              { en: 'Do not move your neck.', vi: 'Đừng cử động cổ.' },
              { en: 'We are checking your airway first.', vi: 'Chúng tôi đang kiểm tra đường thở của bạn trước.' },
              { en: 'He came in after a road accident — GCS 10 at scene.', vi: 'Ông ấy đến sau tai nạn giao thông — GCS 10 tại hiện trường.' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec trauma bay ambient — ambulance, urgent voices, equipment. No dialogue. Mood: urgent, controlled.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen & Repeat: Trauma Handover',
          title_vi: 'Nghe & Lặp lại: Bàn giao Chấn thương',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Paramedic: He came in after a road accident. GCS 10 at scene. Airway clear, breathing okay. We have C-spine precautions.\nNurse Lan: Understood. We are checking your airway first. Sir, can you tell me where it hurts? On a scale of 0 to 10, how is your pain?\nPatient: My leg. Maybe 7.\nNurse Lan: Do not move your neck. We have a collar on. We are checking your airway first. Stay still.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Paramedic (brief, factual), Nurse Lan (calm, clear), Patient (groggy). Trauma bay. Duration: 35-40 sec. Speed: 0.8x slow.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Trauma Handover',
          title_vi: 'Đọc Bàn giao Chấn thương',
          order_index: 3,
          config: {
            script: "Paramedic: He came in after a road accident. GCS 10 at scene. Airway clear.\nNurse: We are checking your airway first. Can you tell me where it hurts? On a scale of 0 to 10, how is your pain?\nPatient: My leg. Maybe 7.\nNurse: Do not move your neck. We are checking your airway first. Stay still.",
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
                id: 'm11l1q1',
                type: 'mcq',
                prompt_en: 'What does "GCS 10 at scene" mean?',
                prompt_vi: '"GCS 10 at scene" có nghĩa là gì?',
                options: [
                  { id: 'a', text: 'The patient is fully awake.', text_vi: 'Bệnh nhân hoàn toàn tỉnh.' },
                  { id: 'b', text: 'Glasgow Coma Scale 10 — reduced consciousness, assessed at the accident scene.', text_vi: 'Thang Hôn mê Glasgow 10 — giảm ý thức, đánh giá tại hiện trường tai nạn.' },
                  { id: 'c', text: 'The patient has no pain.', text_vi: 'Bệnh nhân không đau.' },
                  { id: 'd', text: 'The patient is 10 years old.', text_vi: 'Bệnh nhân 10 tuổi.' },
                ],
                answer: 'b',
                explanation_en: 'GCS 10 indicates reduced consciousness. Reporting "at scene" gives time context for the team.',
                explanation_vi: 'GCS 10 cho biết giảm ý thức. Báo cáo "at scene" đưa bối cảnh thời gian cho đội.',
              },
              {
                id: 'm11l1q2',
                type: 'mcq',
                prompt_en: 'Why say "Do not move your neck" to a trauma patient?',
                prompt_vi: 'Tại sao nói "Do not move your neck" với bệnh nhân chấn thương?',
                options: [
                  { id: 'a', text: 'To be rude.', text_vi: 'Để thô lỗ.' },
                  { id: 'b', text: 'To protect the spine — movement could worsen a cervical spine injury.', text_vi: 'Để bảo vệ cột sống — cử động có thể làm nặng chấn thương cột sống cổ.' },
                  { id: 'c', text: 'Only for RTA patients.', text_vi: 'Chỉ cho bệnh nhân tai nạn giao thông.' },
                  { id: 'd', text: 'To make the patient comfortable.', text_vi: 'Để làm bệnh nhân thoải mái.' },
                ],
                answer: 'b',
                explanation_en: 'C-spine precaution — neck movement can cause or worsen spinal cord injury.',
                explanation_vi: 'Phòng ngừa cột sống cổ — cử động cổ có thể gây hoặc làm nặng chấn thương tủy sống.',
              },
              {
                id: 'm11l1q3',
                type: 'mcq',
                prompt_en: '"We are checking your airway first" — what does this communicate?',
                prompt_vi: '"We are checking your airway first" — truyền đạt điều gì?',
                options: [
                  { id: 'a', text: 'The team is ignoring other injuries.', text_vi: 'Đội đang bỏ qua chấn thương khác.' },
                  { id: 'b', text: 'ABCDE approach — airway is the first priority in trauma assessment.', text_vi: 'Cách tiếp cận ABCDE — đường thở là ưu tiên đầu tiên trong đánh giá chấn thương.' },
                  { id: 'c', text: 'Only for unconscious patients.', text_vi: 'Chỉ cho bệnh nhân bất tỉnh.' },
                  { id: 'd', text: 'The patient cannot breathe.', text_vi: 'Bệnh nhân không thở được.' },
                ],
                answer: 'b',
                explanation_en: 'ABCDE: Airway, Breathing, Circulation, Disability, Exposure. Airway first in trauma.',
                explanation_vi: 'ABCDE: Đường thở, Thở, Tuần hoàn, Khuyết tật, Phơi bày. Đường thở trước trong chấn thương.',
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
      title: 'Patient with Fall and Suspected Hip Fracture',
      title_vi: 'Bệnh nhân Ngã và Nghi ngờ Gãy Xương Hông',
      description: 'An elderly patient has fallen. Learn to assess pain and communicate with the trauma team.',
      description_vi: 'Bệnh nhân cao tuổi đã ngã. Học cách đánh giá đau và giao tiếp với đội chấn thương.',
      stage: 'heads_up',
      order_index: 2,
      est_minutes: 12,
      objective: 'Use pain assessment and trauma language for fall injuries.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Assesses Fall Victim',
          title_vi: 'Nghe: Điều dưỡng Đánh giá Nạn nhân Ngã',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Mai: Mrs. Park, can you tell me where it hurts? On a scale of 0 to 10, how is your pain?\nPatient: My hip. It hurts a lot. Maybe 8.\nNurse Mai: Do not move. We are checking your airway first. Then we will look at your hip. Stay still. Did you hit your head?\nPatient: I do not think so. I fell in the bathroom.\nNurse Mai: Okay. We are checking your airway first. Do not move your neck. Help is here.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Mai (calm, systematic), Patient Park (in pain, elderly). A&E. Duration: 38-42 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Fall Assessment',
          title_vi: 'Đọc Đánh giá Ngã',
          order_index: 2,
          config: {
            script: "Nurse: Can you tell me where it hurts? On a scale of 0 to 10, how is your pain?\nPatient: My hip. Maybe 8.\nNurse: Do not move. We are checking your airway first. Stay still. Did you hit your head?\nPatient: I do not think so.\nNurse: Do not move your neck. Help is here.",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Fall Assessment',
          title_vi: 'Hoàn thành Đánh giá Ngã',
          order_index: 3,
          config: {
            cloze: "Nurse: Can you tell me where it ___? On a scale of 0 to 10, how is your ___?\nPatient: My hip. Maybe 8.\nNurse: Do not ___. We are ___ your airway first. Stay ___. Did you ___ your head?\nNurse: Do not move your ___. Help is here.",
            script: "Nurse: Can you tell me where it hurts? On a scale of 0 to 10, how is your pain?\nPatient: My hip. Maybe 8.\nNurse: Do not move. We are checking your airway first. Stay still. Did you hit your head?\nNurse: Do not move your neck. Help is here.",
          },
        },
        {
          type: 'quiz',
          title: 'Pain Assessment Check',
          title_vi: 'Kiểm tra Đánh giá Đau',
          order_index: 4,
          config: {
            questions: [
              {
                id: 'm11l2q1',
                type: 'mcq',
                prompt_en: '"On a scale of 0 to 10, how is your pain?" — why use this?',
                prompt_vi: '"On a scale of 0 to 10, how is your pain?" — tại sao dùng?',
                options: [
                  { id: 'a', text: 'To make the patient think.', text_vi: 'Để làm bệnh nhân suy nghĩ.' },
                  { id: 'b', text: 'Standardised pain assessment — gives a number for documentation and monitoring.', text_vi: 'Đánh giá đau chuẩn hóa — đưa số để ghi chép và theo dõi.' },
                  { id: 'c', text: 'Only for trauma.', text_vi: 'Chỉ cho chấn thương.' },
                  { id: 'd', text: 'It is not important.', text_vi: 'Nó không quan trọng.' },
                ],
                answer: 'b',
                explanation_en: 'Numeric pain scale (0-10) is standard — allows tracking and communication across team.',
                explanation_vi: 'Thang đau số (0-10) là chuẩn — cho phép theo dõi và giao tiếp trong đội.',
              },
              {
                id: 'm11l2q2',
                type: 'mcq',
                prompt_en: '"Can you tell me where it hurts?" — what does this achieve?',
                prompt_vi: '"Can you tell me where it hurts?" — đạt được gì?',
                options: [
                  { id: 'a', text: 'It delays treatment.', text_vi: 'Nó trì hoãn điều trị.' },
                  { id: 'b', text: 'Opens pain assessment — helps locate injury and prioritise care.', text_vi: 'Mở đánh giá đau — giúp xác định vị trí chấn thương và ưu tiên chăm sóc.' },
                  { id: 'c', text: 'Only for conscious patients.', text_vi: 'Chỉ cho bệnh nhân tỉnh.' },
                  { id: 'd', text: 'The patient may not know.', text_vi: 'Bệnh nhân có thể không biết.' },
                ],
                answer: 'b',
                explanation_en: 'Simple, clear question — gets key information for trauma assessment.',
                explanation_vi: 'Câu hỏi đơn giản, rõ ràng — lấy thông tin chính cho đánh giá chấn thương.',
              },
              {
                id: 'm11l2q3',
                type: 'mcq',
                prompt_en: 'In trauma assessment, why check airway before other injuries?',
                prompt_vi: 'Trong đánh giá chấn thương, tại sao kiểm tra đường thở trước chấn thương khác?',
                options: [
                  { id: 'a', text: 'It is easier.', text_vi: 'Nó dễ hơn.' },
                  { id: 'b', text: 'ABCDE — airway compromise can kill in minutes; must address first.', text_vi: 'ABCDE — tổn thương đường thở có thể gây chết trong vài phút; phải xử lý trước.' },
                  { id: 'c', text: 'Only for head injury.', text_vi: 'Chỉ cho chấn thương đầu.' },
                  { id: 'd', text: 'It is hospital policy.', text_vi: 'Đó là quy định bệnh viện.' },
                ],
                answer: 'b',
                explanation_en: 'Airway is first in ABCDE — without airway, nothing else matters.',
                explanation_vi: 'Đường thở là đầu tiên trong ABCDE — không có đường thở, không gì khác quan trọng.',
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
      title: 'Burns Victim — Initial Assessment',
      title_vi: 'Nạn nhân Bỏng — Đánh giá Ban đầu',
      description: 'A burns victim has arrived. Learn the language for burns assessment and trauma team communication.',
      description_vi: 'Nạn nhân bỏng đã đến. Học ngôn ngữ đánh giá bỏng và giao tiếp đội chấn thương.',
      stage: 'heads_down',
      order_index: 3,
      est_minutes: 15,
      objective: 'Apply trauma language for burns assessment.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Assesses Burns Victim',
          title_vi: 'Nghe: Điều dưỡng Đánh giá Nạn nhân Bỏng',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'normal',
            transcript: "Nurse Hoa: Mr. Costa, can you tell me where it hurts? On a scale of 0 to 10, how is your pain?\nPatient: My arms. It burns. Maybe 9.\nNurse Hoa: We are checking your airway first. Smoke can damage your throat. Do not move your neck. Stay still. We will help you. He came in after a kitchen fire — burns to both arms. GCS 14. Airway clear so far.\nDoctor: Understood. Continue with ABCDE.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Hoa (calm, urgent), Patient Costa (in pain), Doctor (brief). Trauma bay. Duration: 38-42 sec. Normal speed.',
          },
        },
        {
          type: 'cloze',
          title: 'Fill in the Burns Assessment',
          title_vi: 'Điền vào Đánh giá Bỏng',
          order_index: 2,
          config: {
            cloze: "Nurse: Can you tell me where it ___? On a scale of 0 to 10, how is your ___?\nPatient: My arms. Maybe 9.\nNurse: We are ___ your airway first. Smoke can ___ your throat. Do not ___ your neck.\nHe came in after a kitchen ___ — burns to both arms. GCS 14. ___ clear so far.",
            script: "Nurse: Can you tell me where it hurts? On a scale of 0 to 10, how is your pain?\nPatient: My arms. Maybe 9.\nNurse: We are checking your airway first. Smoke can damage your throat. Do not move your neck.\nHe came in after a kitchen fire — burns to both arms. GCS 14. Airway clear so far.",
          },
        },
        {
          type: 'quiz',
          title: 'Burns Assessment Check',
          title_vi: 'Kiểm tra Đánh giá Bỏng',
          order_index: 3,
          config: {
            questions: [
              {
                id: 'm11l3q1',
                type: 'mcq',
                prompt_en: 'Why check airway first in burns from fire?',
                prompt_vi: 'Tại sao kiểm tra đường thở trước trong bỏng do lửa?',
                options: [
                  { id: 'a', text: 'Burns are not serious.', text_vi: 'Bỏng không nghiêm trọng.' },
                  { id: 'b', text: 'Smoke inhalation can cause airway swelling — life-threatening.', text_vi: 'Hít khói có thể gây sưng đường thở — đe dọa tính mạng.' },
                  { id: 'c', text: 'Only for facial burns.', text_vi: 'Chỉ cho bỏng mặt.' },
                  { id: 'd', text: 'It is routine.', text_vi: 'Đó là thường lệ.' },
                ],
                answer: 'b',
                explanation_en: 'Smoke inhalation can cause delayed airway swelling — must assess early.',
                explanation_vi: 'Hít khói có thể gây sưng đường thở chậm — phải đánh giá sớm.',
              },
              {
                id: 'm11l3q2',
                type: 'mcq',
                prompt_en: '"He came in after a kitchen fire — burns to both arms" — what is this?',
                prompt_vi: '"He came in after a kitchen fire — burns to both arms" — đây là gì?',
                options: [
                  { id: 'a', text: 'A diagnosis.', text_vi: 'Chẩn đoán.' },
                  { id: 'b', text: 'Trauma handover — mechanism of injury and initial findings.', text_vi: 'Bàn giao chấn thương — cơ chế chấn thương và phát hiện ban đầu.' },
                  { id: 'c', text: 'A complaint.', text_vi: 'Phàn nàn.' },
                  { id: 'd', text: 'Only for doctors.', text_vi: 'Chỉ cho bác sĩ.' },
                ],
                answer: 'b',
                explanation_en: 'Brief handover: mechanism + injuries — gives team context quickly.',
                explanation_vi: 'Bàn giao ngắn: cơ chế + chấn thương — đưa bối cảnh nhanh cho đội.',
              },
              {
                id: 'm11l3q3',
                type: 'mcq',
                prompt_en: 'GCS 14 in a trauma patient indicates:',
                prompt_vi: 'GCS 14 ở bệnh nhân chấn thương cho biết:',
                options: [
                  { id: 'a', text: 'The patient is dead.', text_vi: 'Bệnh nhân đã chết.' },
                  { id: 'b', text: 'Mildly reduced consciousness — alert but not fully orientated.', text_vi: 'Giảm ý thức nhẹ — tỉnh nhưng chưa hoàn toàn định hướng.' },
                  { id: 'c', text: 'The patient has no pain.', text_vi: 'Bệnh nhân không đau.' },
                  { id: 'd', text: 'Normal for burns.', text_vi: 'Bình thường cho bỏng.' },
                ],
                answer: 'b',
                explanation_en: 'GCS 15 = fully alert. GCS 14 = one point lost — often eye or verbal response.',
                explanation_vi: 'GCS 15 = hoàn toàn tỉnh. GCS 14 = mất một điểm — thường phản ứng mắt hoặc lời nói.',
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
      title: 'Head Injury — GCS Assessment',
      title_vi: 'Chấn thương Đầu — Đánh giá GCS',
      description: 'A patient has a head injury. Learn to communicate GCS assessment and C-spine precautions.',
      description_vi: 'Bệnh nhân có chấn thương đầu. Học cách truyền đạt đánh giá GCS và phòng ngừa cột sống cổ.',
      stage: 'heads_down',
      order_index: 4,
      est_minutes: 15,
      objective: 'Apply GCS and trauma language for head injury.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'A&E — Head Injury Patient',
          title_vi: 'Cấp cứu — Bệnh nhân Chấn thương Đầu',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'A&E Trauma Bay',
            setting_vi: 'Khu Chấn thương Cấp cứu',
            context_en: 'Mr. Ahmed, 52, was found unconscious after a fall. He is now responding to voice. You need to assess his GCS, maintain C-spine precautions, and hand over to the trauma team. He came in after a fall — suspected head injury.',
            context_vi: 'Ông Ahmed, 52 tuổi, được tìm thấy bất tỉnh sau khi ngã. Ông đang phản ứng với giọng nói. Bạn cần đánh giá GCS, duy trì phòng ngừa cột sống cổ và bàn giao cho đội chấn thương. Ông đến sau khi ngã — nghi ngờ chấn thương đầu.',
            key_phrases: [
              { en: 'Can you tell me where it hurts?', vi: 'Bạn có thể nói cho tôi biết đau ở đâu không?' },
              { en: 'On a scale of 0 to 10, how is your pain?', vi: 'Trên thang 0 đến 10, cơn đau của bạn thế nào?' },
              { en: 'Do not move your neck.', vi: 'Đừng cử động cổ.' },
              { en: 'We are checking your airway first.', vi: 'Chúng tôi đang kiểm tra đường thở của bạn trước.' },
              { en: 'He came in after a fall — GCS 10 at scene.', vi: 'Ông ấy đến sau khi ngã — GCS 10 tại hiện trường.' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec trauma bay — head injury, urgent. No dialogue. Mood: urgent, focused.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Handover for Head Injury',
          title_vi: 'Nghe: Bàn giao Điều dưỡng cho Chấn thương Đầu',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Linh: He came in after a fall — GCS 10 at scene. Now GCS 12. Airway clear, breathing okay. C-spine precautions in place. Do not move your neck, sir. We are checking your airway first. Can you tell me where it hurts? On a scale of 0 to 10, how is your pain?\nPatient: Head. Maybe 6.\nNurse Linh: Understood. Stay still. We will take care of you.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Linh (structured, calm), Patient Ahmed (confused). Trauma bay. Duration: 38-42 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Head Injury Handover',
          title_vi: 'Đọc Bàn giao Chấn thương Đầu',
          order_index: 3,
          config: {
            script: "Nurse: He came in after a fall — GCS 10 at scene. Now GCS 12. Airway clear. C-spine precautions in place. Do not move your neck. We are checking your airway first. Can you tell me where it hurts? On a scale of 0 to 10, how is your pain?\nPatient: Head. Maybe 6.\nNurse: Stay still. We will take care of you.",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Head Injury Handover',
          title_vi: 'Hoàn thành Bàn giao Chấn thương Đầu',
          order_index: 4,
          config: {
            cloze: "Nurse: He came in after a ___ — GCS 10 at ___. Now GCS 12. ___ clear. C-spine ___ in place.\nDo not ___ your neck. We are ___ your airway first.\nCan you tell me where it ___? On a scale of 0 to 10, how is your ___?",
            script: "Nurse: He came in after a fall — GCS 10 at scene. Now GCS 12. Airway clear. C-spine precautions in place.\nDo not move your neck. We are checking your airway first.\nCan you tell me where it hurts? On a scale of 0 to 10, how is your pain?",
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 5 — HEADS DOWN  (audio_shadow → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Trauma Team Handover at Hospital Doors',
      title_vi: 'Bàn giao Đội Chấn thương tại Cửa Bệnh viện',
      description: 'You receive a trauma patient at the doors. Practice the full handover and record yourself.',
      description_vi: 'Bạn nhận bệnh nhân chấn thương tại cửa. Thực hành bàn giao đầy đủ và ghi âm.',
      stage: 'heads_down',
      order_index: 5,
      est_minutes: 18,
      objective: 'Deliver trauma handover independently.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Trauma Handover at Doors',
          title_vi: 'Nghe: Bàn giao Chấn thương tại Cửa',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Paramedic: He came in after a road accident — GCS 10 at scene. Airway clear, breathing okay. Suspected pelvic fracture. C-spine collar on.\nNurse Anh: Understood. We are checking your airway first. Sir, can you tell me where it hurts? On a scale of 0 to 10, how is your pain? Do not move your neck. We have you. Help is here.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Paramedic (brief), Nurse Anh (receiving handover, addressing patient). Hospital doors. Duration: 35-40 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'cloze',
          title: 'Build the Trauma Handover',
          title_vi: 'Xây dựng Bàn giao Chấn thương',
          order_index: 2,
          config: {
            cloze: "Paramedic: He came in after a road ___ — GCS 10 at ___. Airway ___, breathing okay. Suspected ___ fracture. C-spine ___ on.\nNurse: We are ___ your airway first. Can you tell me where it ___? On a scale of 0 to 10, how is your ___? Do not ___ your neck.",
            script: "Paramedic: He came in after a road accident — GCS 10 at scene. Airway clear, breathing okay. Suspected pelvic fracture. C-spine collar on.\nNurse: We are checking your airway first. Can you tell me where it hurts? On a scale of 0 to 10, how is your pain? Do not move your neck.",
          },
        },
        {
          type: 'no_script',
          title: 'Speak It — No Script',
          title_vi: 'Nói — Không Kịch bản',
          order_index: 3,
          config: {
            context: 'You are receiving a trauma handover. Then you address the patient. Use trauma phrases.',
            cues: [
              'Receive: "He came in after... — GCS X at scene"',
              '"We are checking your airway first"',
              '"Can you tell me where it hurts?"',
              '"On a scale of 0 to 10, how is your pain?"',
              '"Do not move your neck"',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Trauma Handover',
          title_vi: 'Ghi âm Bàn giao Chấn thương của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself giving a trauma handover or assessing a trauma patient. Use at least four key phrases from this module.',
            prompt_vi: 'Ghi âm bạn đưa bàn giao chấn thương hoặc đánh giá bệnh nhân chấn thương. Sử dụng ít nhất bốn cụm từ chính từ module này.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself. Include: "He came in after...", "GCS X at scene", "We are checking your airway first", "Can you tell me where it hurts?", "On a scale of 0 to 10, how is your pain?", "Do not move your neck". Aim for 35-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 6 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Nurse to Doctor: Trauma Handover',
      title_vi: 'Luyện tập Cặp — Điều dưỡng đến Bác sĩ: Bàn giao Chấn thương',
      description: 'Work with a partner. One plays the nurse giving trauma handover, one plays the doctor. Practice ABCD language.',
      description_vi: 'Làm việc với đối tác. Một người đóng vai điều dưỡng đưa bàn giao chấn thương, một người đóng vai bác sĩ. Thực hành ngôn ngữ ABCD.',
      stage: 'heads_together',
      order_index: 6,
      est_minutes: 20,
      objective: 'Practice trauma handover with a partner.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Trauma Handover to Doctor',
          title_vi: 'Kịch bản Đầy đủ — Bàn giao Chấn thương cho Bác sĩ',
          order_index: 1,
          config: {
            script: "Nurse: He came in after a road accident — GCS 10 at scene. Airway clear, breathing okay. C-spine collar on. Can you tell me where it hurts? On a scale of 0 to 10, how is your pain? Do not move your neck. We are checking your airway first. Suspected fractured femur. BP 95 over 60, heart rate 110.\nDoctor: Understood. Continue ABCDE. I will assess circulation.",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Nurse: He came in after a road ___ — GCS 10 at ___. ___ clear, breathing okay. C-spine ___ on.\nCan you tell me where it ___? On a scale of 0 to 10, how is your ___? Do not ___ your neck.\nWe are ___ your airway first.",
            script: "Nurse: He came in after a road accident — GCS 10 at scene. Airway clear, breathing okay. C-spine collar on.\nCan you tell me where it hurts? On a scale of 0 to 10, how is your pain? Do not move your neck.\nWe are checking your airway first.",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Give trauma handover (RTA or fall). Nurse B: Play the doctor. Switch roles.',
            cues: [
              '"He came in after... — GCS X at scene"',
              '"We are checking your airway first"',
              '"Can you tell me where it hurts?"',
              '"On a scale of 0 to 10, how is your pain?"',
              '"Do not move your neck"',
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
            prompt_en: 'Record your best performance as the nurse giving a trauma handover.',
            prompt_vi: 'Ghi âm phần trình diễn tốt nhất của bạn với vai điều dưỡng đưa bàn giao chấn thương.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'PAIR PRACTICE: Complete all three rounds. Submit ONE recording — your best as the nurse. Include at least three key trauma phrases. Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 7 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Nurse to Nurse: Trauma Assessment',
      title_vi: 'Luyện tập Cặp — Điều dưỡng đến Điều dưỡng: Đánh giá Chấn thương',
      description: 'One plays the nurse assessing a trauma patient, one plays the patient. Practice pain assessment and C-spine language.',
      description_vi: 'Một người đóng vai điều dưỡng đánh giá bệnh nhân chấn thương, một người đóng vai bệnh nhân. Thực hành đánh giá đau và ngôn ngữ cột sống cổ.',
      stage: 'heads_together',
      order_index: 7,
      est_minutes: 20,
      objective: 'Practice trauma assessment with a partner.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Nurse Assesses Trauma Patient',
          title_vi: 'Kịch bản Đầy đủ — Điều dưỡng Đánh giá Bệnh nhân Chấn thương',
          order_index: 1,
          config: {
            script: "Nurse: We are checking your airway first. Can you tell me where it hurts? On a scale of 0 to 10, how is your pain? Do not move your neck. Stay still. You came in after a fall. We are taking care of you. Help is here.\nPatient: My back. Maybe 7.\nNurse: Understood. Do not move your neck. We are checking your airway first. We will look at your back next.",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Nurse: We are ___ your airway first. Can you tell me where it ___? On a scale of 0 to 10, how is your ___?\nDo not ___ your neck. Stay ___. You came in after a ___. Help is here.\nNurse: Do not move your ___. We will look at your ___ next.",
            script: "Nurse: We are checking your airway first. Can you tell me where it hurts? On a scale of 0 to 10, how is your pain?\nDo not move your neck. Stay still. You came in after a fall. Help is here.\nNurse: Do not move your neck. We will look at your back next.",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Assess trauma patient (fall or burns). Nurse B: Play the patient. Switch roles.',
            cues: [
              '"We are checking your airway first"',
              '"Can you tell me where it hurts?"',
              '"On a scale of 0 to 10, how is your pain?"',
              '"Do not move your neck"',
              '"Stay still" / "Help is here"',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Trauma Assessment',
          title_vi: 'Ghi âm Đánh giá Chấn thương của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself assessing a trauma patient or giving a trauma handover.',
            prompt_vi: 'Ghi âm bạn đánh giá bệnh nhân chấn thương hoặc đưa bàn giao chấn thương.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself. Include: "We are checking your airway first", "Can you tell me where it hurts?", "On a scale of 0 to 10, how is your pain?", "Do not move your neck". Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 8 — ASSESSMENT  (quiz → cloze → recording_submit → self_reflection)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Module Assessment — Trauma & Self-Reflection',
      title_vi: 'Kiểm tra Module — Chấn thương & Tự Phản ánh',
      description: 'A comprehensive assessment of trauma communication. Finish by reflecting on what you have learned.',
      description_vi: 'Đánh giá toàn diện về giao tiếp chấn thương. Kết thúc bằng phản ánh những gì bạn đã học.',
      stage: 'assessment',
      order_index: 8,
      est_minutes: 25,
      objective: 'Demonstrate Module 11 trauma communication language.',
      steps: [
        {
          type: 'quiz',
          title: 'Module 11 Knowledge Check',
          title_vi: 'Kiểm tra Kiến thức Module 11',
          order_index: 1,
          config: {
            questions: [
              {
                id: 'm11l8q1',
                type: 'mcq',
                prompt_en: '[Part A — Vocabulary] "He came in after a road accident — GCS 10 at scene" — what does this communicate?',
                prompt_vi: '[Phần A — Từ vựng] "He came in after a road accident — GCS 10 at scene" — truyền đạt điều gì?',
                options: [
                  { id: 'a', text: 'The patient drove to hospital.', text_vi: 'Bệnh nhân lái xe đến bệnh viện.' },
                  { id: 'b', text: 'Mechanism of injury (RTA) and consciousness level at scene — key trauma handover info.', text_vi: 'Cơ chế chấn thương (tai nạn giao thông) và mức độ ý thức tại hiện trường — thông tin bàn giao chấn thương chính.' },
                  { id: 'c', text: 'The patient has no injuries.', text_vi: 'Bệnh nhân không có chấn thương.' },
                  { id: 'd', text: 'Only for paramedics.', text_vi: 'Chỉ cho nhân viên cấp cứu.' },
                ],
                answer: 'b',
                explanation_en: 'Mechanism + GCS at scene gives team critical context for trauma management.',
                explanation_vi: 'Cơ chế + GCS tại hiện trường đưa bối cảnh quan trọng cho đội quản lý chấn thương.',
              },
              {
                id: 'm11l8q2',
                type: 'mcq',
                prompt_en: '[Part B — Protocol] "We are checking your airway first" — why?',
                prompt_vi: '[Phần B — Quy trình] "We are checking your airway first" — tại sao?',
                options: [
                  { id: 'a', text: 'Airway is easiest to check.', text_vi: 'Đường thở dễ kiểm tra nhất.' },
                  { id: 'b', text: 'ABCDE — airway compromise kills fastest; must address first.', text_vi: 'ABCDE — tổn thương đường thở gây chết nhanh nhất; phải xử lý trước.' },
                  { id: 'c', text: 'Only for unconscious patients.', text_vi: 'Chỉ cho bệnh nhân bất tỉnh.' },
                  { id: 'd', text: 'Hospital policy.', text_vi: 'Quy định bệnh viện.' },
                ],
                answer: 'b',
                explanation_en: 'A before B before C — airway is first in ABCDE trauma approach.',
                explanation_vi: 'A trước B trước C — đường thở là đầu tiên trong cách tiếp cận chấn thương ABCDE.',
              },
              {
                id: 'm11l8q3',
                type: 'mcq',
                prompt_en: '[Part C — Communication] "On a scale of 0 to 10, how is your pain?" — why use this?',
                prompt_vi: '[Phần C — Giao tiếp] "On a scale of 0 to 10, how is your pain?" — tại sao dùng?',
                options: [
                  { id: 'a', text: 'To delay treatment.', text_vi: 'Để trì hoãn điều trị.' },
                  { id: 'b', text: 'Standardised pain score — allows documentation and tracking across team.', text_vi: 'Điểm đau chuẩn hóa — cho phép ghi chép và theo dõi trong đội.' },
                  { id: 'c', text: 'Only for trauma.', text_vi: 'Chỉ cho chấn thương.' },
                  { id: 'd', text: 'The patient may not know.', text_vi: 'Bệnh nhân có thể không biết.' },
                ],
                answer: 'b',
                explanation_en: 'Numeric pain scale is universal — enables consistent communication.',
                explanation_vi: 'Thang đau số là phổ quát — cho phép giao tiếp nhất quán.',
              },
              {
                id: 'm11l8q4',
                type: 'mcq',
                prompt_en: '[Part D — Decision] A trauma patient tries to sit up. You should say:',
                prompt_vi: '[Phần D — Quyết định] Bệnh nhân chấn thương cố ngồi dậy. Bạn nên nói:',
                options: [
                  { id: 'a', text: 'Go ahead.', text_vi: 'Cứ làm đi.' },
                  { id: 'b', text: 'Do not move your neck. Stay still.', text_vi: 'Đừng cử động cổ. Nằm yên.' },
                  { id: 'c', text: 'Wait for the doctor.', text_vi: 'Chờ bác sĩ.' },
                  { id: 'd', text: 'Nothing — let them move.', text_vi: 'Không gì — để họ cử động.' },
                ],
                answer: 'b',
                explanation_en: 'C-spine precaution — prevent movement until spine is cleared.',
                explanation_vi: 'Phòng ngừa cột sống cổ — ngăn cử động cho đến khi cột sống được xác nhận an toàn.',
              },
            ],
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Full Trauma Handover',
          title_vi: 'Hoàn thành Bàn giao Chấn thương Đầy đủ',
          order_index: 2,
          config: {
            cloze: "Nurse: He came in after a [road accident/fall] — GCS ___ at scene. ___ clear, breathing okay. C-spine ___ on.\nCan you tell me where it ___? On a scale of 0 to 10, how is your ___? Do not ___ your neck. We are ___ your airway first.",
            script: "Nurse: He came in after a [road accident/fall] — GCS [X] at scene. Airway clear, breathing okay. C-spine collar on.\nCan you tell me where it hurts? On a scale of 0 to 10, how is your pain? Do not move your neck. We are checking your airway first.",
          },
        },
        {
          type: 'recording_submit',
          title: 'Final Assessment Recording',
          title_vi: 'Ghi âm Đánh giá Cuối cùng',
          order_index: 3,
          config: {
            prompt_en: 'Record yourself giving a trauma handover or assessing a trauma patient. Use all five key phrases.',
            prompt_vi: 'Ghi âm bạn đưa bàn giao chấn thương hoặc đánh giá bệnh nhân chấn thương. Sử dụng cả năm cụm từ chính.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: '[FINAL ASSESSMENT] You are Nurse [Your Name]. Give trauma handover or assess trauma patient. Include: "He came in after...", "GCS X at scene", "We are checking your airway first", "Can you tell me where it hurts?", "On a scale of 0 to 10, how is your pain?", "Do not move your neck". Aim for 40-50 seconds.',
          },
        },
        {
          type: 'self_reflection',
          title: 'Module 11 Self-Reflection',
          title_vi: 'Tự Phản ánh Module 11',
          order_index: 4,
          config: {
            prompts: [
              { key: 'confidence', type: 'slider', label_en: 'How confident do you feel using trauma language in English now?', label_vi: 'Bạn cảm thấy tự tin sử dụng ngôn ngữ chấn thương bằng tiếng Anh chưa?' },
              { key: 'usefulness', type: 'slider', label_en: 'How useful was this module for your real clinical work?', label_vi: 'Module này có hữu ích cho công việc lâm sàng thực tế của bạn không?' },
              { key: 'difficulty', type: 'slider', label_en: 'How difficult was the trauma language in this module?', label_vi: 'Ngôn ngữ chấn thương trong module này khó ở mức độ nào?' },
              { key: 'pair_helped', type: 'slider', label_en: 'Did the pair practice (Lessons 6 and 7) help you feel more prepared?', label_vi: 'Luyện tập cặp đôi (Bài 6 và 7) có giúp bạn cảm thấy sẵn sàng hơn không?' },
              { key: 'open_feedback', type: 'text', label_en: 'Which trauma phrase will you try to use on your next shift?', label_vi: 'Bạn sẽ thử dùng cụm từ chấn thương nào trong ca làm tiếp theo?' },
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
