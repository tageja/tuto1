/**
 * NurseMed Emergency Nursing Communication - Module 6
 * "Reassurance Under Pressure"
 *
 * Module 6 teaches nurses to keep patients and families calm during emergencies
 * while working efficiently. Focus on emotional support language, honest
 * communication, and setting realistic expectations.
 *
 * 8 Lessons: Heads Up → Heads Down → Heads Together → Assessment
 * Module shell ALREADY EXISTS — do NOT insert into nursed_modules.
 */

import { getServiceClient } from '../supabase'

export async function seedModule6(moduleId: string) {
  const db = getServiceClient()

  // Delete existing lessons (steps cascade or delete explicitly)
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
      title: 'Calming a Panicking Patient in A&E',
      title_vi: 'Trấn an Bệnh nhân Hoảng sợ tại Cấp cứu',
      description: 'A patient arrives at A&E very frightened. Learn the language nurses use to reassure while staying efficient.',
      description_vi: 'Bệnh nhân đến cấp cứu rất sợ hãi. Học ngôn ngữ điều dưỡng dùng để trấn an trong khi vẫn hiệu quả.',
      stage: 'heads_up',
      order_index: 1,
      est_minutes: 12,
      objective: 'Identify key reassurance phrases used with frightened patients.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'A&E — Panicking Patient',
          title_vi: 'Cấp cứu — Bệnh nhân Hoảng sợ',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'A&E Triage — Busy Evening',
            setting_vi: 'Phân loại Cấp cứu — Buổi tối bận rộn',
            context_en: 'Mr. Davies, 45, has been brought in by ambulance after a fall. He is very anxious, breathing fast, and keeps asking "Am I going to be okay?" You need to reassure him while completing your initial assessment.',
            context_vi: 'Ông Davies, 45 tuổi, được đưa đến bằng xe cấp cứu sau khi ngã. Ông rất lo lắng, thở nhanh và liên tục hỏi "Tôi có ổn không?" Bạn cần trấn an ông trong khi hoàn thành đánh giá ban đầu.',
            key_phrases: [
              { en: 'I understand you are frightened.', vi: 'Tôi hiểu bạn đang sợ hãi.' },
              { en: 'We are doing everything we can.', vi: 'Chúng tôi đang làm mọi thứ có thể.' },
              { en: 'Can you please stay calm so we can help you?', vi: 'Bạn có thể bình tĩnh để chúng tôi giúp bạn không?' },
              { en: 'I will update you as soon as I know more.', vi: 'Tôi sẽ cập nhật cho bạn ngay khi biết thêm.' },
              { en: 'I need you to trust us right now.', vi: 'Tôi cần bạn tin tưởng chúng tôi ngay bây giờ.' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec A&E ambient — triage area, monitor beeps, distant voices. No dialogue. Mood: busy but controlled.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen & Repeat: Reassurance Language',
          title_vi: 'Nghe & Lặp lại: Ngôn ngữ Trấn an',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: Mr. Davies, I am Nurse Lan. I understand you are frightened. We are doing everything we can to help you.\nPatient: Am I going to be okay?\nNurse: I need you to stay calm so we can assess you properly. The doctor will see you very soon.\nPatient: It hurts. I am scared.\nNurse: I know. We are here. Can you take a slow breath for me? Good. I will update you as soon as I know more. I need you to trust us right now.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Lan (female, Vietnamese accent OK, calm and reassuring), Patient Davies (male, anxious, British accent). A&E triage. Duration: 35-40 sec. Speed: 0.8x slow.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Reassurance Dialogue',
          title_vi: 'Đọc Hội thoại Trấn an',
          order_index: 3,
          config: {
            script: "Nurse: Mr. Davies, I am Nurse Lan. I understand you are frightened.\nPatient: Am I going to be okay?\nNurse: We are doing everything we can. Can you please stay calm so we can help you?\nPatient: It hurts.\nNurse: I know. I will update you as soon as I know more. I need you to trust us right now.",
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
                id: 'm6l1q1',
                type: 'mcq',
                prompt_en: 'What does "I understand you are frightened" communicate?',
                prompt_vi: '"I understand you are frightened" truyền đạt điều gì?',
                options: [
                  { id: 'a', text: 'The nurse is also scared.', text_vi: 'Điều dưỡng cũng sợ.' },
                  { id: 'b', text: 'Empathy — acknowledging the patient\'s feelings before giving information.', text_vi: 'Đồng cảm — thừa nhận cảm xúc bệnh nhân trước khi đưa thông tin.' },
                  { id: 'c', text: 'The patient should not be scared.', text_vi: 'Bệnh nhân không nên sợ.' },
                  { id: 'd', text: 'The nurse will leave soon.', text_vi: 'Điều dưỡng sẽ rời đi sớm.' },
                ],
                answer: 'b',
                explanation_en: 'Acknowledging fear first builds trust and helps the patient feel heard before you give clinical information.',
                explanation_vi: 'Thừa nhận nỗi sợ trước giúp xây dựng lòng tin và giúp bệnh nhân cảm thấy được lắng nghe.',
              },
              {
                id: 'm6l1q2',
                type: 'mcq',
                prompt_en: 'Why say "Can you please stay calm so we can help you?"',
                prompt_vi: 'Tại sao nói "Bạn có thể bình tĩnh để chúng tôi giúp bạn không?"',
                options: [
                  { id: 'a', text: 'To tell the patient they are being difficult.', text_vi: 'Để nói bệnh nhân đang khó tính.' },
                  { id: 'b', text: 'To link calm behaviour with better care — practical and kind.', text_vi: 'Để liên kết hành vi bình tĩnh với chăm sóc tốt hơn — thực tế và tử tế.' },
                  { id: 'c', text: 'To make the patient feel guilty.', text_vi: 'Để làm bệnh nhân cảm thấy có lỗi.' },
                  { id: 'd', text: 'To avoid answering their questions.', text_vi: 'Để tránh trả lời câu hỏi của họ.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase explains why calm matters — it helps the team work effectively. It is both honest and supportive.',
                explanation_vi: 'Cụm từ này giải thích tại sao bình tĩnh quan trọng — giúp đội ngũ làm việc hiệu quả.',
              },
              {
                id: 'm6l1q3',
                type: 'mcq',
                prompt_en: '"I need you to trust us right now" — when is this appropriate?',
                prompt_vi: '"Tôi cần bạn tin tưởng chúng tôi ngay bây giờ" — khi nào phù hợp?',
                options: [
                  { id: 'a', text: 'When you want to avoid answering questions.', text_vi: 'Khi bạn muốn tránh trả lời câu hỏi.' },
                  { id: 'b', text: 'When the patient needs to cooperate urgently for their own safety.', text_vi: 'Khi bệnh nhân cần hợp tác khẩn cấp vì an toàn của chính họ.' },
                  { id: 'c', text: 'Only when the patient speaks English.', text_vi: 'Chỉ khi bệnh nhân nói tiếng Anh.' },
                  { id: 'd', text: 'When you are in a hurry.', text_vi: 'Khi bạn đang vội.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase is used when immediate cooperation is needed for treatment — it is direct but not harsh.',
                explanation_vi: 'Cụm từ này dùng khi cần hợp tác ngay lập tức để điều trị — trực tiếp nhưng không gay gắt.',
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
      title: 'Anxious Family at ICU Doors',
      title_vi: 'Gia đình Lo lắng tại Cửa ICU',
      description: 'Family members are waiting outside ICU. Learn how to communicate honestly while managing their anxiety.',
      description_vi: 'Người nhà đang chờ bên ngoài ICU. Học cách giao tiếp chân thật trong khi quản lý lo lắng của họ.',
      stage: 'heads_up',
      order_index: 2,
      est_minutes: 12,
      objective: 'Use reassurance phrases with anxious family members.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Speaks to Family at ICU',
          title_vi: 'Nghe: Điều dưỡng Nói chuyện với Gia đình tại ICU',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: Hello, I am Nurse Mai. You are here for Mr. Ahmed?\nFamily: Yes. How is he? Is he going to make it?\nNurse: I understand you are worried. We are doing everything we can. His condition is serious but he is stable at the moment.\nFamily: When can we see him?\nNurse: The doctor will speak with you soon. I will update you as soon as I know more. Can you please wait here? I need you to trust us right now.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Mai (calm, empathetic), Family member (anxious, worried). ICU waiting area. Duration: 35-40 sec. Speed: 0.8x slow.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Family Dialogue',
          title_vi: 'Đọc Hội thoại với Gia đình',
          order_index: 2,
          config: {
            script: "Nurse: Hello, I am Nurse Mai. You are here for Mr. Ahmed?\nFamily: Yes. How is he?\nNurse: I understand you are worried. We are doing everything we can.\nFamily: When can we see him?\nNurse: I will update you as soon as I know more. Can you please wait here?",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Reassurance Phrases',
          title_vi: 'Hoàn thành Cụm từ Trấn an',
          order_index: 3,
          config: {
            cloze: "Nurse: I ___ you are worried. We are ___ everything we can.\nFamily: Is he going to be okay?\nNurse: I will ___ you as soon as I know more. I need you to ___ us right now.\nCan you please ___ calm so we can help him?",
            script: "Nurse: I understand you are worried. We are doing everything we can.\nFamily: Is he going to be okay?\nNurse: I will update you as soon as I know more. I need you to trust us right now.\nCan you please stay calm so we can help him?",
          },
        },
        {
          type: 'quiz',
          title: 'Family Communication Check',
          title_vi: 'Kiểm tra Giao tiếp Gia đình',
          order_index: 4,
          config: {
            questions: [
              {
                id: 'm6l2q1',
                type: 'mcq',
                prompt_en: 'A family member asks "Is he going to make it?" What should you avoid?',
                prompt_vi: 'Người nhà hỏi "Ông ấy có qua khỏi không?" Bạn nên tránh gì?',
                options: [
                  { id: 'a', text: 'Giving false promises like "He will be fine."', text_vi: 'Hứa hẹn sai như "Ông ấy sẽ ổn."' },
                  { id: 'b', text: 'Acknowledging their worry first.', text_vi: 'Thừa nhận lo lắng của họ trước.' },
                  { id: 'c', text: 'Saying "We are doing everything we can."', text_vi: 'Nói "Chúng tôi đang làm mọi thứ có thể."' },
                  { id: 'd', text: 'Asking them to wait.', text_vi: 'Yêu cầu họ chờ.' },
                ],
                answer: 'a',
                explanation_en: 'Never promise outcomes you cannot guarantee. Be honest: "We are doing everything we can" is truthful and reassuring.',
                explanation_vi: 'Không bao giờ hứa kết quả bạn không thể đảm bảo. Thành thật: "Chúng tôi đang làm mọi thứ có thể" là chân thật và trấn an.',
              },
              {
                id: 'm6l2q2',
                type: 'mcq',
                prompt_en: 'What does "I will update you as soon as I know more" achieve?',
                prompt_vi: '"I will update you as soon as I know more" đạt được gì?',
                options: [
                  { id: 'a', text: 'It delays the conversation indefinitely.', text_vi: 'Nó trì hoãn cuộc trò chuyện vô thời hạn.' },
                  { id: 'b', text: 'It sets a clear expectation — you will return with information.', text_vi: 'Nó đặt kỳ vọng rõ ràng — bạn sẽ quay lại với thông tin.' },
                  { id: 'c', text: 'It means you will not tell them anything.', text_vi: 'Nó có nghĩa bạn sẽ không nói gì với họ.' },
                  { id: 'd', text: 'It is only for doctors to say.', text_vi: 'Chỉ bác sĩ mới nói được.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase promises follow-up. It reduces anxiety by giving the family something to expect.',
                explanation_vi: 'Cụm từ này hứa sẽ cập nhật. Nó giảm lo lắng bằng cách cho gia đình điều gì đó để mong đợi.',
              },
              {
                id: 'm6l2q3',
                type: 'mcq',
                prompt_en: 'When a family is very distressed, what should you do first?',
                prompt_vi: 'Khi gia đình rất đau khổ, bạn nên làm gì trước?',
                options: [
                  { id: 'a', text: 'Give them the full medical diagnosis.', text_vi: 'Cho họ chẩn đoán y khoa đầy đủ.' },
                  { id: 'b', text: 'Acknowledge their feelings before giving information.', text_vi: 'Thừa nhận cảm xúc của họ trước khi đưa thông tin.' },
                  { id: 'c', text: 'Ask them to leave immediately.', text_vi: 'Yêu cầu họ rời đi ngay.' },
                  { id: 'd', text: 'Call security.', text_vi: 'Gọi bảo vệ.' },
                ],
                answer: 'b',
                explanation_en: 'Acknowledge first: "I understand you are worried." This helps the family feel heard before you share clinical information.',
                explanation_vi: 'Thừa nhận trước: "Tôi hiểu bạn đang lo lắng." Điều này giúp gia đình cảm thấy được lắng nghe trước khi bạn chia sẻ thông tin lâm sàng.',
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
      title: 'Patient Refusing Treatment During Emergency',
      title_vi: 'Bệnh nhân Từ chối Điều trị trong Cấp cứu',
      description: 'A patient is refusing necessary treatment because of fear. Learn to de-escalate and gain cooperation.',
      description_vi: 'Bệnh nhân từ chối điều trị cần thiết vì sợ. Học cách giảm căng thẳng và giành hợp tác.',
      stage: 'heads_down',
      order_index: 3,
      est_minutes: 15,
      objective: 'Use reassurance language to gain cooperation from a reluctant patient.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Calms a Reluctant Patient',
          title_vi: 'Nghe: Điều dưỡng Trấn an Bệnh nhân Miễn cưỡng',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'normal',
            transcript: "Nurse: Mrs. Park, I need to put a needle in your arm for the medicine. I know you are frightened.\nPatient: No. I do not want it. I am scared of needles.\nNurse: I understand. We are doing everything we can to help you. This will help you feel better. Can you please stay calm so we can help you?\nPatient: Will it hurt?\nNurse: You may feel a sharp sting for a moment. I will explain everything as I go. I need you to trust us right now. This is important for your treatment.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Hoa (calm, patient), Mrs. Park (anxious, reluctant). Treatment room. Duration: 38-42 sec. Normal speed.',
          },
        },
        {
          type: 'cloze',
          title: 'Fill in the Reassurance Dialogue',
          title_vi: 'Điền vào Hội thoại Trấn an',
          order_index: 2,
          config: {
            cloze: "Nurse: Mrs. Park, I need to put a ___ in your arm. I know you are ___.\nPatient: No. I do not want it.\nNurse: I ___. We are doing everything we can. Can you please ___ calm so we can help you?\nPatient: Will it hurt?\nNurse: You may feel a sharp ___ for a moment. I need you to ___ us right now.",
            script: "Nurse: Mrs. Park, I need to put a needle in your arm. I know you are frightened.\nPatient: No. I do not want it.\nNurse: I understand. We are doing everything we can. Can you please stay calm so we can help you?\nPatient: Will it hurt?\nNurse: You may feel a sharp sting for a moment. I need you to trust us right now.",
          },
        },
        {
          type: 'quiz',
          title: 'Refusal and Reassurance',
          title_vi: 'Từ chối và Trấn an',
          order_index: 3,
          config: {
            questions: [
              {
                id: 'm6l3q1',
                type: 'mcq',
                prompt_en: 'A patient says "I do not want it. I am scared." What should you do first?',
                prompt_vi: 'Bệnh nhân nói "Tôi không muốn. Tôi sợ." Bạn nên làm gì trước?',
                options: [
                  { id: 'a', text: 'Proceed with the procedure anyway.', text_vi: 'Tiến hành thủ thuật dù sao đi nữa.' },
                  { id: 'b', text: 'Acknowledge their fear, then explain why the procedure is needed.', text_vi: 'Thừa nhận nỗi sợ, sau đó giải thích tại sao cần thủ thuật.' },
                  { id: 'c', text: 'Tell them they have no choice.', text_vi: 'Nói với họ họ không có lựa chọn.' },
                  { id: 'd', text: 'Call the doctor to force them.', text_vi: 'Gọi bác sĩ để ép họ.' },
                ],
                answer: 'b',
                explanation_en: 'Acknowledge fear first, then explain. "I understand" builds trust before you ask for cooperation.',
                explanation_vi: 'Thừa nhận nỗi sợ trước, sau đó giải thích. "Tôi hiểu" xây dựng lòng tin trước khi bạn yêu cầu hợp tác.',
              },
              {
                id: 'm6l3q2',
                type: 'mcq',
                prompt_en: 'Why say "You may feel a sharp sting for a moment"?',
                prompt_vi: 'Tại sao nói "Bạn có thể cảm thấy đau nhói trong chốc lát"?',
                options: [
                  { id: 'a', text: 'To scare the patient more.', text_vi: 'Để làm bệnh nhân sợ hơn.' },
                  { id: 'b', text: 'To set honest expectations — reduces surprise and builds trust.', text_vi: 'Để đặt kỳ vọng chân thật — giảm bất ngờ và xây dựng lòng tin.' },
                  { id: 'c', text: 'To avoid the procedure.', text_vi: 'Để tránh thủ thuật.' },
                  { id: 'd', text: 'Only for children.', text_vi: 'Chỉ cho trẻ em.' },
                ],
                answer: 'b',
                explanation_en: 'Honest preparation reduces anxiety. Patients trust you more when you tell them what to expect.',
                explanation_vi: 'Chuẩn bị chân thật giảm lo lắng. Bệnh nhân tin tưởng bạn hơn khi bạn nói họ sẽ cảm thấy gì.',
              },
              {
                id: 'm6l3q3',
                type: 'mcq',
                prompt_en: '"I will explain everything as I go" — what does this achieve?',
                prompt_vi: '"Tôi sẽ giải thích mọi thứ khi tôi làm" — đạt được gì?',
                options: [
                  { id: 'a', text: 'It delays the procedure.', text_vi: 'Nó trì hoãn thủ thuật.' },
                  { id: 'b', text: 'It gives the patient a sense of control and reduces fear of the unknown.', text_vi: 'Nó cho bệnh nhân cảm giác kiểm soát và giảm sợ điều chưa biết.' },
                  { id: 'c', text: 'It is only for complex procedures.', text_vi: 'Chỉ cho thủ thuật phức tạp.' },
                  { id: 'd', text: 'It makes the nurse look uncertain.', text_vi: 'Nó làm điều dưỡng trông không chắc chắn.' },
                ],
                answer: 'b',
                explanation_en: 'Explaining as you go keeps the patient informed and reduces anxiety about what happens next.',
                explanation_vi: 'Giải thích khi làm giữ bệnh nhân được thông tin và giảm lo lắng về điều gì sẽ xảy ra tiếp theo.',
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
      title: 'De-escalating a Distressed Relative',
      title_vi: 'Giảm Căng thẳng Người nhà Đau khổ',
      description: 'A family member is shouting and demanding answers. Learn to stay calm and redirect the conversation.',
      description_vi: 'Người nhà đang la hét và yêu cầu câu trả lời. Học cách giữ bình tĩnh và chuyển hướng cuộc trò chuyện.',
      stage: 'heads_down',
      order_index: 4,
      est_minutes: 15,
      objective: 'Apply reassurance language when a relative is very upset.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'Ward — Distressed Relative',
          title_vi: 'Khoa — Người nhà Đau khổ',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'Medical Ward — Visiting Hours',
            setting_vi: 'Khoa Nội — Giờ Thăm',
            context_en: 'Mr. Costa\'s son has arrived and is very angry. He is shouting that no one is telling him what is going on. You need to de-escalate and provide clear, honest information.',
            context_vi: 'Con trai ông Costa đã đến và rất tức giận. Anh ấy la lên rằng không ai nói cho anh biết chuyện gì đang xảy ra. Bạn cần giảm căng thẳng và cung cấp thông tin rõ ràng, chân thật.',
            key_phrases: [
              { en: 'I understand you are upset.', vi: 'Tôi hiểu bạn đang bực.' },
              { en: 'I will update you as soon as I know more.', vi: 'Tôi sẽ cập nhật cho bạn ngay khi biết thêm.' },
              { en: 'Can you please stay calm so we can help your father?', vi: 'Bạn có thể bình tĩnh để chúng tôi giúp cha bạn không?' },
              { en: 'We are doing everything we can.', vi: 'Chúng tôi đang làm mọi thứ có thể.' },
              { en: 'The doctor will speak with you shortly.', vi: 'Bác sĩ sẽ nói chuyện với bạn trong giây lát.' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec ward ambient — visiting area, distant voices. No dialogue. Mood: tense.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse De-escalates Distressed Son',
          title_vi: 'Nghe: Điều dưỡng Giảm Căng thẳng Con trai Đau khổ',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: Sir, I am Nurse Linh. I understand you are upset. We want to help your father.\nSon: Nobody tells me anything! What is going on?\nNurse: I understand. We are doing everything we can. The doctor will speak with you shortly. I will update you as soon as I know more.\nSon: I need to know now!\nNurse: Can you please stay calm so we can help your father? I need you to trust us right now. The doctor is on the ward and will come to you in a few minutes.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Linh (calm, firm but kind), Son (angry, frustrated). Ward corridor. Duration: 35-40 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the De-escalation Dialogue',
          title_vi: 'Đọc Hội thoại Giảm Căng thẳng',
          order_index: 3,
          config: {
            script: "Nurse: Sir, I am Nurse Linh. I understand you are upset.\nSon: What is going on?\nNurse: We are doing everything we can. The doctor will speak with you shortly.\nSon: I need to know now!\nNurse: Can you please stay calm so we can help your father? I need you to trust us right now.",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the De-escalation Phrases',
          title_vi: 'Hoàn thành Cụm từ Giảm Căng thẳng',
          order_index: 4,
          config: {
            cloze: "Nurse: I ___ you are upset. We want to help your ___.\nSon: What is going on?\nNurse: We are ___ everything we can. The doctor will ___ with you shortly.\nCan you please ___ calm so we can help your father? I need you to ___ us right now.",
            script: "Nurse: I understand you are upset. We want to help your father.\nSon: What is going on?\nNurse: We are doing everything we can. The doctor will speak with you shortly.\nCan you please stay calm so we can help your father? I need you to trust us right now.",
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 5 — HEADS DOWN  (audio_shadow → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Reassuring a Child\'s Parent in Paediatric ED',
      title_vi: 'Trấn an Cha mẹ Trẻ tại Cấp cứu Nhi',
      description: 'A parent is terrified about their child. Practice the full reassurance sequence and record yourself.',
      description_vi: 'Cha mẹ rất sợ hãi về con mình. Thực hành chuỗi trấn an đầy đủ và ghi âm.',
      stage: 'heads_down',
      order_index: 5,
      est_minutes: 18,
      objective: 'Deliver reassurance to a frightened parent independently.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Reassures Parent of Sick Child',
          title_vi: 'Nghe: Điều dưỡng Trấn an Cha mẹ Trẻ Bệnh',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse: Hello, I am Nurse Anh. I understand you are frightened. Your daughter is in good hands.\nParent: Is she going to be okay? She is so small.\nNurse: We are doing everything we can. The doctor is with her now. Can you please stay calm so we can focus on helping her?\nParent: When can I see her?\nNurse: I will update you as soon as I know more. I need you to trust us right now. We will take good care of her.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Anh (warm, reassuring), Parent (anxious, tearful). Paediatric ED. Duration: 35-40 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'cloze',
          title: 'Build the Parent Reassurance Dialogue',
          title_vi: 'Xây dựng Hội thoại Trấn an Cha mẹ',
          order_index: 2,
          config: {
            cloze: "Nurse: I ___ you are frightened. Your daughter is in good ___.\nParent: Is she going to be okay?\nNurse: We are ___ everything we can. Can you please ___ calm so we can help her?\nNurse: I will ___ you as soon as I know more. I need you to ___ us right now.",
            script: "Nurse: I understand you are frightened. Your daughter is in good hands.\nParent: Is she going to be okay?\nNurse: We are doing everything we can. Can you please stay calm so we can help her?\nNurse: I will update you as soon as I know more. I need you to trust us right now.",
          },
        },
        {
          type: 'no_script',
          title: 'Speak It — No Script',
          title_vi: 'Nói — Không Kịch bản',
          order_index: 3,
          config: {
            context: 'You are Nurse [Your Name]. A parent of a sick child is very frightened. Reassure them using the key phrases from this module.',
            cues: [
              'Introduce yourself',
              'Acknowledge their fear — "I understand you are frightened"',
              'Say "We are doing everything we can"',
              'Ask them to stay calm so you can help',
              'Promise to update them — "I will update you as soon as I know more"',
              'Say "I need you to trust us right now"',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Parent Reassurance',
          title_vi: 'Ghi âm Trấn an Cha mẹ của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself reassuring a frightened parent of a sick child. Use at least three key phrases from this module.',
            prompt_vi: 'Ghi âm bạn trấn an cha mẹ sợ hãi của trẻ bệnh. Sử dụng ít nhất ba cụm từ chính từ module này.',
            timer_seconds: 60,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself as the nurse reassuring a frightened parent. Include: "I understand you are frightened", "We are doing everything we can", and either "I will update you as soon as I know more" or "I need you to trust us right now." Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 6 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Calming a Confused Elderly Patient',
      title_vi: 'Luyện tập Cặp — Trấn an Bệnh nhân Cao tuổi Lú lẫn',
      description: 'Work with a partner. One plays the nurse, one plays the confused patient. Practice reassurance language.',
      description_vi: 'Làm việc với đối tác. Một người đóng vai điều dưỡng, một người đóng vai bệnh nhân lú lẫn. Thực hành ngôn ngữ trấn an.',
      stage: 'heads_together',
      order_index: 6,
      est_minutes: 20,
      objective: 'Practice reassurance with a confused elderly patient in pair role-play.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Nurse and Confused Patient',
          title_vi: 'Kịch bản Đầy đủ — Điều dưỡng và Bệnh nhân Lú lẫn',
          order_index: 1,
          config: {
            script: "Nurse: Good morning, Mr. Tran. I am Nurse Lan. I understand you are confused. That is okay. We are here to help you.\nPatient: Where am I? I want to go home.\nNurse: You are in hospital. We are doing everything we can to help you get better. Can you please stay calm so we can help you?\nPatient: I am scared.\nNurse: I know. I will update you as soon as I know more. I need you to trust us right now. We will take good care of you.",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Nurse: I ___ you are confused. That is okay. We are ___ to help you.\nPatient: Where am I?\nNurse: You are in ___. We are doing everything we ___. Can you please ___ calm so we can help you?\nNurse: I will ___ you as soon as I know more. I need you to ___ us right now.",
            script: "Nurse: I understand you are confused. That is okay. We are here to help you.\nPatient: Where am I?\nNurse: You are in hospital. We are doing everything we can. Can you please stay calm so we can help you?\nNurse: I will update you as soon as I know more. I need you to trust us right now.",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Play the nurse calming a confused elderly patient. Nurse B: Play the patient. Switch roles after one round.',
            cues: [
              'Introduce yourself and acknowledge confusion',
              'Say "We are here to help you"',
              'Ask them to stay calm',
              'Reassure: "I will update you as soon as I know more"',
              'Say "I need you to trust us right now"',
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
            prompt_en: 'Record your best performance as the nurse reassuring a confused patient.',
            prompt_vi: 'Ghi âm phần trình diễn tốt nhất của bạn với vai điều dưỡng trấn an bệnh nhân lú lẫn.',
            timer_seconds: 60,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'PAIR PRACTICE: Complete all three rounds. Submit ONE recording — your best as the nurse. Include at least two key reassurance phrases. Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 7 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Managing Family Demanding Answers',
      title_vi: 'Luyện tập Cặp — Quản lý Gia đình Yêu cầu Câu trả lời',
      description: 'A family member is demanding immediate answers. Practice staying calm and setting expectations.',
      description_vi: 'Người nhà đang yêu cầu câu trả lời ngay lập tức. Thực hành giữ bình tĩnh và đặt kỳ vọng.',
      stage: 'heads_together',
      order_index: 7,
      est_minutes: 20,
      objective: 'Practice managing a family member who demands immediate information.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Nurse and Demanding Family Member',
          title_vi: 'Kịch bản Đầy đủ — Điều dưỡng và Người nhà Yêu cầu',
          order_index: 1,
          config: {
            script: "Nurse: I understand you want answers. We are doing everything we can. The doctor will speak with you shortly.\nFamily: I need to know NOW. Why is nobody telling me anything?\nNurse: I will update you as soon as I know more. Can you please stay calm so we can focus on your relative?\nFamily: This is not good enough.\nNurse: I need you to trust us right now. The team is with your relative. We will come to you as soon as we have information.",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Nurse: I ___ you want answers. We are doing everything we ___.\nFamily: I need to know NOW.\nNurse: I will ___ you as soon as I know more. Can you please ___ calm so we can focus on your ___?\nNurse: I need you to ___ us right now. We will come to you as soon as we have ___.",
            script: "Nurse: I understand you want answers. We are doing everything we can.\nFamily: I need to know NOW.\nNurse: I will update you as soon as I know more. Can you please stay calm so we can focus on your relative?\nNurse: I need you to trust us right now. We will come to you as soon as we have information.",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Play the nurse managing a demanding family member. Nurse B: Play the family member. Switch roles after one round.',
            cues: [
              'Acknowledge they want answers',
              'Say "We are doing everything we can"',
              'Promise to update — "I will update you as soon as I know more"',
              'Ask them to stay calm',
              'Say "I need you to trust us right now"',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Family Communication',
          title_vi: 'Ghi âm Giao tiếp Gia đình của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself managing a family member who is demanding immediate answers.',
            prompt_vi: 'Ghi âm bạn xử lý người nhà đang yêu cầu câu trả lời ngay lập tức.',
            timer_seconds: 60,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself as the nurse. The family member is demanding answers. Stay calm, acknowledge their concern, and use the key reassurance phrases. Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 8 — ASSESSMENT  (quiz → cloze → recording_submit → self_reflection)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Module Assessment — Reassurance & Self-Reflection',
      title_vi: 'Kiểm tra Module — Trấn an & Tự Phản ánh',
      description: 'A comprehensive assessment of reassurance language. Finish by reflecting on what you have learned.',
      description_vi: 'Đánh giá toàn diện về ngôn ngữ trấn an. Kết thúc bằng phản ánh những gì bạn đã học.',
      stage: 'assessment',
      order_index: 8,
      est_minutes: 25,
      objective: 'Demonstrate Module 6 reassurance language across all scenarios.',
      steps: [
        {
          type: 'quiz',
          title: 'Module 6 Knowledge Check',
          title_vi: 'Kiểm tra Kiến thức Module 6',
          order_index: 1,
          config: {
            questions: [
              {
                id: 'm6l8q1',
                type: 'mcq',
                prompt_en: '[Part A — Vocabulary] "I understand you are frightened" — what does this achieve?',
                prompt_vi: '[Phần A — Từ vựng] "I understand you are frightened" — đạt được gì?',
                options: [
                  { id: 'a', text: 'It tells the patient to stop being scared.', text_vi: 'Nó bảo bệnh nhân ngừng sợ.' },
                  { id: 'b', text: 'It shows empathy and acknowledges their feelings before giving information.', text_vi: 'Nó thể hiện đồng cảm và thừa nhận cảm xúc của họ trước khi đưa thông tin.' },
                  { id: 'c', text: 'It means the nurse is also frightened.', text_vi: 'Nó có nghĩa điều dưỡng cũng sợ.' },
                  { id: 'd', text: 'It is only for children.', text_vi: 'Chỉ cho trẻ em.' },
                ],
                answer: 'b',
                explanation_en: 'Acknowledging fear first builds trust and helps the patient feel heard before you give clinical information.',
                explanation_vi: 'Thừa nhận nỗi sợ trước xây dựng lòng tin và giúp bệnh nhân cảm thấy được lắng nghe.',
              },
              {
                id: 'm6l8q2',
                type: 'mcq',
                prompt_en: '[Part B — Protocol] A family member is shouting. What should you do first?',
                prompt_vi: '[Phần B — Quy trình] Người nhà đang la hét. Bạn nên làm gì trước?',
                options: [
                  { id: 'a', text: 'Shout back to match their volume.', text_vi: 'La lại để khớp âm lượng của họ.' },
                  { id: 'b', text: 'Acknowledge their feelings before giving information.', text_vi: 'Thừa nhận cảm xúc của họ trước khi đưa thông tin.' },
                  { id: 'c', text: 'Walk away immediately.', text_vi: 'Bỏ đi ngay.' },
                  { id: 'd', text: 'Call security.', text_vi: 'Gọi bảo vệ.' },
                ],
                answer: 'b',
                explanation_en: 'Acknowledge first: "I understand you are upset." This often de-escalates before you give information.',
                explanation_vi: 'Thừa nhận trước: "Tôi hiểu bạn đang bực." Điều này thường giảm căng thẳng trước khi bạn đưa thông tin.',
              },
              {
                id: 'm6l8q3',
                type: 'mcq',
                prompt_en: '[Part C — Communication] "I will update you as soon as I know more" — when is this appropriate?',
                prompt_vi: '[Phần C — Giao tiếp] "I will update you as soon as I know more" — khi nào phù hợp?',
                options: [
                  { id: 'a', text: 'When you want to avoid the family.', text_vi: 'Khi bạn muốn tránh gia đình.' },
                  { id: 'b', text: 'When you do not have the answer yet but want to set a clear expectation.', text_vi: 'Khi bạn chưa có câu trả lời nhưng muốn đặt kỳ vọng rõ ràng.' },
                  { id: 'c', text: 'Only for doctors to say.', text_vi: 'Chỉ bác sĩ mới nói.' },
                  { id: 'd', text: 'When the patient is asleep.', text_vi: 'Khi bệnh nhân đang ngủ.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase promises follow-up when you do not have answers yet. It reduces anxiety by giving something to expect.',
                explanation_vi: 'Cụm từ này hứa sẽ cập nhật khi bạn chưa có câu trả lời. Nó giảm lo lắng bằng cách cho điều gì đó để mong đợi.',
              },
              {
                id: 'm6l8q4',
                type: 'mcq',
                prompt_en: '[Part D — Decision] A patient refuses an IV because they are scared. You should:',
                prompt_vi: '[Phần D — Quyết định] Bệnh nhân từ chối truyền tĩnh mạch vì sợ. Bạn nên:',
                options: [
                  { id: 'a', text: 'Proceed without their consent.', text_vi: 'Tiến hành không có đồng ý của họ.' },
                  { id: 'b', text: 'Acknowledge their fear, explain the procedure simply, and ask for cooperation.', text_vi: 'Thừa nhận nỗi sợ, giải thích thủ thuật đơn giản, và xin hợp tác.' },
                  { id: 'c', text: 'Tell them they have no choice.', text_vi: 'Nói với họ họ không có lựa chọn.' },
                  { id: 'd', text: 'Cancel the procedure.', text_vi: 'Hủy thủ thuật.' },
                ],
                answer: 'b',
                explanation_en: 'Acknowledge → explain → ask. This approach often gains cooperation while respecting the patient.',
                explanation_vi: 'Thừa nhận → giải thích → yêu cầu. Cách tiếp cận này thường giành được hợp tác trong khi tôn trọng bệnh nhân.',
              },
            ],
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Full Reassurance Sequence',
          title_vi: 'Hoàn thành Chuỗi Trấn an Đầy đủ',
          order_index: 2,
          config: {
            cloze: "Nurse: I ___ you are frightened. We are ___ everything we can.\nCan you please ___ calm so we can help you?\nI will ___ you as soon as I know more.\nI need you to ___ us right now.",
            script: "Nurse: I understand you are frightened. We are doing everything we can.\nCan you please stay calm so we can help you?\nI will update you as soon as I know more.\nI need you to trust us right now.",
          },
        },
        {
          type: 'recording_submit',
          title: 'Final Assessment Recording',
          title_vi: 'Ghi âm Đánh giá Cuối cùng',
          order_index: 3,
          config: {
            prompt_en: 'Record yourself reassuring a frightened patient or family member. Use all five key phrases from this module.',
            prompt_vi: 'Ghi âm bạn trấn an bệnh nhân hoặc người nhà sợ hãi. Sử dụng cả năm cụm từ chính từ module này.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: '[FINAL ASSESSMENT] You are Nurse [Your Name]. Reassure a frightened patient or family member. Include: "I understand you are frightened", "We are doing everything we can", "Can you please stay calm so we can help you?", "I will update you as soon as I know more", "I need you to trust us right now." Aim for 40-50 seconds.',
          },
        },
        {
          type: 'self_reflection',
          title: 'Module 6 Self-Reflection',
          title_vi: 'Tự Phản ánh Module 6',
          order_index: 4,
          config: {
            prompts: [
              {
                key: 'confidence',
                type: 'slider',
                label_en: 'How confident do you feel using reassurance phrases in English now?',
                label_vi: 'Bạn cảm thấy tự tin sử dụng cụm từ trấn an bằng tiếng Anh chưa?',
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
                label_en: 'How difficult was the reassurance language in this module?',
                label_vi: 'Ngôn ngữ trấn an trong module này khó ở mức độ nào?',
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
                label_en: 'Which reassurance phrase will you try to use on your next shift?',
                label_vi: 'Bạn sẽ thử dùng cụm từ trấn an nào trong ca làm tiếp theo?',
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
