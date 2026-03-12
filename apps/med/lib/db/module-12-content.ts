/**
 * NurseMed Emergency Nursing Communication - Module 12
 * "Family Communication in Emergencies"
 *
 * Module 12 teaches the hardest communication — breaking bad news,
 * explaining serious diagnosis, discussing CPR decisions, supporting
 * grieving families, managing information requests during active treatment.
 *
 * 8 Lessons: Heads Up → Heads Down → Heads Together → Assessment
 * Module shell ALREADY EXISTS — do NOT insert into nursed_modules.
 */

import { getServiceClient } from '../supabase'

export async function seedModule12(moduleId: string) {
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
      title: 'Explaining a Cardiac Arrest to the Family',
      title_vi: 'Giải thích Ngừng tim cho Gia đình',
      description: 'A patient has had a cardiac arrest. Learn the language nurses use to explain what happened to the family.',
      description_vi: 'Bệnh nhân đã ngừng tim. Học ngôn ngữ điều dưỡng dùng để giải thích cho gia đình điều gì đã xảy ra.',
      stage: 'heads_up',
      order_index: 1,
      est_minutes: 12,
      objective: 'Identify key phrases for explaining cardiac arrest to family.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'Resuscitation Room — Family Waiting',
          title_vi: 'Phòng Hồi sức — Gia đình Đang Chờ',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'Resuscitation Room — Family Room',
            setting_vi: 'Phòng Hồi sức — Phòng Gia đình',
            context_en: 'Mr. Davies has had a cardiac arrest. The team has been resuscitating for 25 minutes. The family has been waiting. You need to bring them to a quiet room and explain what has happened. You must be honest, compassionate, and clear.',
            context_vi: 'Ông Davies đã ngừng tim. Đội đã hồi sức 25 phút. Gia đình đã chờ. Bạn cần đưa họ vào phòng yên tĩnh và giải thích điều đã xảy ra. Bạn phải chân thật, đồng cảm và rõ ràng.',
            key_phrases: [
              { en: 'I have some difficult news to share.', vi: 'Tôi có tin khó nói cần chia sẻ.' },
              { en: 'We did everything we could.', vi: 'Chúng tôi đã làm mọi thứ có thể.' },
              { en: 'His condition has become very serious.', vi: 'Tình trạng của ông ấy đã trở nên rất nghiêm trọng.' },
              { en: 'I cannot give a certainty, but I want to be honest with you.', vi: 'Tôi không thể đưa ra chắc chắn, nhưng tôi muốn thành thật với bạn.' },
              { en: 'Is there someone you would like us to call?', vi: 'Có ai bạn muốn chúng tôi gọi không?' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec quiet room ambient — family room, subdued. No dialogue. Mood: solemn, compassionate.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen & Repeat: Breaking Difficult News',
          title_vi: 'Nghe & Lặp lại: Thông báo Tin Khó',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Lan: Please sit down. I have some difficult news to share. Your husband's heart stopped. The team has been working on him for 25 minutes. We did everything we could. I am sorry. His condition has become very serious. I cannot give a certainty, but I want to be honest with you. The doctor will come to speak with you shortly. Is there someone you would like us to call?\nWife: My daughter. Please call my daughter.\nNurse Lan: Of course. We will call her. Would you like to sit with him?",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Lan (female, calm, compassionate, Vietnamese accent OK), Wife (shocked, tearful). Quiet family room. Duration: 38-42 sec. Speed: 0.8x slow.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Difficult News Dialogue',
          title_vi: 'Đọc Hội thoại Thông báo Tin Khó',
          order_index: 3,
          config: {
            script: "Nurse: I have some difficult news to share. Your husband's heart stopped. We did everything we could. His condition has become very serious. I cannot give a certainty, but I want to be honest with you. The doctor will come shortly. Is there someone you would like us to call?\nWife: My daughter. Please call my daughter.\nNurse: Of course. We will call her.",
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
                id: 'm12l1q1',
                type: 'mcq',
                prompt_en: 'Why say "I have some difficult news to share" before giving the news?',
                prompt_vi: 'Tại sao nói "I have some difficult news to share" trước khi đưa tin?',
                options: [
                  { id: 'a', text: 'To delay the conversation.', text_vi: 'Để trì hoãn cuộc trò chuyện.' },
                  { id: 'b', text: 'To prepare the family emotionally — signals that what follows will be hard to hear.', text_vi: 'Để chuẩn bị tâm lý gia đình — báo hiệu điều tiếp theo sẽ khó nghe.' },
                  { id: 'c', text: 'Only for bad news.', text_vi: 'Chỉ cho tin xấu.' },
                  { id: 'd', text: 'To avoid responsibility.', text_vi: 'Để tránh trách nhiệm.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase creates a "warning shot" — helps family brace before hearing the full news.',
                explanation_vi: 'Cụm từ này tạo "cảnh báo" — giúp gia đình chuẩn bị trước khi nghe tin đầy đủ.',
              },
              {
                id: 'm12l1q2',
                type: 'mcq',
                prompt_en: '"We did everything we could" — what does this communicate?',
                prompt_vi: '"We did everything we could" — truyền đạt điều gì?',
                options: [
                  { id: 'a', text: 'The team gave up.', text_vi: 'Đội đã bỏ cuộc.' },
                  { id: 'b', text: 'The team tried their best — acknowledges effort, may provide some comfort.', text_vi: 'Đội đã cố gắng hết sức — thừa nhận nỗ lực, có thể mang chút an ủi.' },
                  { id: 'c', text: 'The patient will be fine.', text_vi: 'Bệnh nhân sẽ ổn.' },
                  { id: 'd', text: 'Only the doctor could help.', text_vi: 'Chỉ bác sĩ mới giúp được.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase acknowledges the team\'s effort — important for family to hear that nothing was left undone.',
                explanation_vi: 'Cụm từ này thừa nhận nỗ lực của đội — quan trọng để gia đình biết không có gì bỏ sót.',
              },
              {
                id: 'm12l1q3',
                type: 'mcq',
                prompt_en: '"Is there someone you would like us to call?" — why ask this?',
                prompt_vi: '"Is there someone you would like us to call?" — tại sao hỏi?',
                options: [
                  { id: 'a', text: 'To end the conversation.', text_vi: 'Để kết thúc cuộc trò chuyện.' },
                  { id: 'b', text: 'To offer practical support — family may need loved ones present during crisis.', text_vi: 'Để cung cấp hỗ trợ thực tế — gia đình có thể cần người thân có mặt trong khủng hoảng.' },
                  { id: 'c', text: 'Only for legal reasons.', text_vi: 'Chỉ vì lý do pháp lý.' },
                  { id: 'd', text: 'To avoid talking more.', text_vi: 'Để tránh nói thêm.' },
                ],
                answer: 'b',
                explanation_en: 'Offering to call someone shows care and gives the family a concrete action — supports them in crisis.',
                explanation_vi: 'Đề nghị gọi ai đó thể hiện quan tâm và cho gia đình hành động cụ thể — hỗ trợ họ trong khủng hoảng.',
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
      title: 'Informing Family That Condition Has Worsened',
      title_vi: 'Thông báo Gia đình Tình trạng Đã Xấu đi',
      description: 'A patient\'s condition has deteriorated overnight. Learn to communicate this honestly to the family.',
      description_vi: 'Tình trạng bệnh nhân đã xấu đi qua đêm. Học cách truyền đạt điều này chân thật cho gia đình.',
      stage: 'heads_up',
      order_index: 2,
      est_minutes: 12,
      objective: 'Use phrases for communicating deterioration to family.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Informs Family of Deterioration',
          title_vi: 'Nghe: Điều dưỡng Thông báo Gia đình về Xấu đi',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Mai: I have some difficult news to share. Your father's condition has become very serious overnight. His breathing has become weaker. We did everything we could to support him. I cannot give a certainty, but I want to be honest with you. The doctor will come to explain more. Is there someone you would like us to call? Would you like to sit with him?\nSon: Yes. Can I call my sister?\nNurse Mai: Of course. We will give you privacy. Take your time.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Mai (compassionate, clear), Son (shocked). Ward corridor or family room. Duration: 38-42 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Deterioration Conversation',
          title_vi: 'Đọc Cuộc trò chuyện Xấu đi',
          order_index: 2,
          config: {
            script: "Nurse: I have some difficult news to share. Your father's condition has become very serious overnight. We did everything we could. I cannot give a certainty, but I want to be honest with you. The doctor will come to explain more. Is there someone you would like us to call?\nSon: Yes. Can I call my sister?\nNurse: Of course. We will give you privacy.",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Deterioration Conversation',
          title_vi: 'Hoàn thành Cuộc trò chuyện Xấu đi',
          order_index: 3,
          config: {
            cloze: "Nurse: I have some ___ news to share. Your father's ___ has become very ___ overnight.\nWe did everything we ___. I cannot give a ___, but I want to be ___ with you.\nThe doctor will come to ___ more. Is there someone you would like us to ___?",
            script: "Nurse: I have some difficult news to share. Your father's condition has become very serious overnight.\nWe did everything we could. I cannot give a certainty, but I want to be honest with you.\nThe doctor will come to explain more. Is there someone you would like us to call?",
          },
        },
        {
          type: 'quiz',
          title: 'Deterioration Communication Check',
          title_vi: 'Kiểm tra Giao tiếp Xấu đi',
          order_index: 4,
          config: {
            questions: [
              {
                id: 'm12l2q1',
                type: 'mcq',
                prompt_en: '"His condition has become very serious" — why use this phrase?',
                prompt_vi: '"His condition has become very serious" — tại sao dùng cụm từ này?',
                options: [
                  { id: 'a', text: 'To scare the family.', text_vi: 'Để làm gia đình sợ.' },
                  { id: 'b', text: 'To communicate deterioration honestly without using blunt terms like "dying".', text_vi: 'Để truyền đạt xấu đi chân thật mà không dùng từ gay gắt như "sắp chết".' },
                  { id: 'c', text: 'Only for terminal patients.', text_vi: 'Chỉ cho bệnh nhân giai đoạn cuối.' },
                  { id: 'd', text: 'To avoid the doctor.', text_vi: 'Để tránh bác sĩ.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase is honest but not harsh — allows family to understand gravity without shock.',
                explanation_vi: 'Cụm từ này chân thật nhưng không gay gắt — cho phép gia đình hiểu mức độ nghiêm trọng mà không sốc.',
              },
              {
                id: 'm12l2q2',
                type: 'mcq',
                prompt_en: '"I cannot give a certainty, but I want to be honest with you" — what does this achieve?',
                prompt_vi: '"I cannot give a certainty, but I want to be honest with you" — đạt được gì?',
                options: [
                  { id: 'a', text: 'The nurse avoids answering.', text_vi: 'Điều dưỡng tránh trả lời.' },
                  { id: 'b', text: 'Acknowledges uncertainty while building trust — honest communication in difficult situations.', text_vi: 'Thừa nhận không chắc chắn trong khi xây dựng lòng tin — giao tiếp chân thật trong tình huống khó.' },
                  { id: 'c', text: 'Only for doctors.', text_vi: 'Chỉ cho bác sĩ.' },
                  { id: 'd', text: 'The nurse does not know.', text_vi: 'Điều dưỡng không biết.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase balances honesty with humility — you cannot predict, but you are not hiding.',
                explanation_vi: 'Cụm từ này cân bằng chân thật với khiêm tốn — bạn không thể dự đoán, nhưng bạn không che giấu.',
              },
              {
                id: 'm12l2q3',
                type: 'mcq',
                prompt_en: 'When informing family of deterioration, what should you do after giving the news?',
                prompt_vi: 'Khi thông báo gia đình về xấu đi, bạn nên làm gì sau khi đưa tin?',
                options: [
                  { id: 'a', text: 'Leave immediately.', text_vi: 'Rời đi ngay.' },
                  { id: 'b', text: 'Offer support — call someone, sit with patient, give privacy. Stay present if they need you.', text_vi: 'Đề nghị hỗ trợ — gọi ai đó, ngồi với bệnh nhân, cho không gian riêng. Ở lại nếu họ cần.' },
                  { id: 'c', text: 'Only answer medical questions.', text_vi: 'Chỉ trả lời câu hỏi y tế.' },
                  { id: 'd', text: 'Ask them to leave.', text_vi: 'Yêu cầu họ rời đi.' },
                ],
                answer: 'b',
                explanation_en: 'Offering practical support and presence shows care — family needs to feel supported.',
                explanation_vi: 'Đề nghị hỗ trợ thực tế và sự hiện diện thể hiện quan tâm — gia đình cần cảm thấy được hỗ trợ.',
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
      title: 'Answering "Will They Survive?" Professionally',
      title_vi: 'Trả lời "Họ Có Sống được Không?" Chuyên nghiệp',
      description: 'A family member asks the hardest question. Learn to respond honestly and compassionately.',
      description_vi: 'Người nhà hỏi câu khó nhất. Học cách phản hồi chân thật và đồng cảm.',
      stage: 'heads_down',
      order_index: 3,
      est_minutes: 15,
      objective: 'Respond to survival questions professionally.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Answers Survival Question',
          title_vi: 'Nghe: Điều dưỡng Trả lời Câu hỏi Sống còn',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'normal',
            transcript: "Family: Will he survive? Please tell me. Will he make it?\nNurse Hoa: I understand you need to know. I cannot give a certainty, but I want to be honest with you. His condition has become very serious. We did everything we could. The doctor will come to speak with you and explain the situation fully. Is there someone you would like us to call? I will stay with you until the doctor arrives.\nFamily: Thank you. Yes, please call my brother.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Hoa (calm, honest, compassionate), Family member (desperate, tearful). Family room. Duration: 38-42 sec. Normal speed.',
          },
        },
        {
          type: 'cloze',
          title: 'Fill in the Survival Question Response',
          title_vi: 'Điền vào Phản hồi Câu hỏi Sống còn',
          order_index: 2,
          config: {
            cloze: "Family: Will he ___? Please tell me.\nNurse: I understand you need to ___. I cannot give a ___, but I want to be ___ with you.\nHis ___ has become very serious. We did everything we ___. The doctor will come to ___ with you. Is there someone you would like us to ___?",
            script: "Family: Will he survive? Please tell me.\nNurse: I understand you need to know. I cannot give a certainty, but I want to be honest with you.\nHis condition has become very serious. We did everything we could. The doctor will come to speak with you. Is there someone you would like us to call?",
          },
        },
        {
          type: 'quiz',
          title: 'Survival Question Response Check',
          title_vi: 'Kiểm tra Phản hồi Câu hỏi Sống còn',
          order_index: 3,
          config: {
            questions: [
              {
                id: 'm12l3q1',
                type: 'mcq',
                prompt_en: 'When asked "Will they survive?", what should you avoid?',
                prompt_vi: 'Khi được hỏi "Họ có sống được không?", bạn nên tránh gì?',
                options: [
                  { id: 'a', text: 'Giving a definite "yes" or "no" when outcome is uncertain — you cannot predict.', text_vi: 'Đưa "có" hoặc "không" chắc chắn khi kết quả không chắc — bạn không thể dự đoán.' },
                  { id: 'b', text: 'Saying "I understand you need to know."', text_vi: 'Nói "Tôi hiểu bạn cần biết."' },
                  { id: 'c', text: 'Offering to call someone.', text_vi: 'Đề nghị gọi ai đó.' },
                  { id: 'd', text: 'Being honest.', text_vi: 'Thành thật.' },
                ],
                answer: 'a',
                explanation_en: 'Never give false hope or false certainty — "I cannot give a certainty" is the honest response.',
                explanation_vi: 'Không bao giờ đưa hy vọng giả hoặc chắc chắn giả — "Tôi không thể đưa ra chắc chắn" là phản hồi chân thật.',
              },
              {
                id: 'm12l3q2',
                type: 'mcq',
                prompt_en: 'Why say "I understand you need to know" before answering?',
                prompt_vi: 'Tại sao nói "I understand you need to know" trước khi trả lời?',
                options: [
                  { id: 'a', text: 'To delay the answer.', text_vi: 'Để trì hoãn câu trả lời.' },
                  { id: 'b', text: 'To acknowledge their emotional need — validates their question before giving difficult answer.', text_vi: 'Để thừa nhận nhu cầu cảm xúc của họ — xác nhận câu hỏi trước khi đưa câu trả lời khó.' },
                  { id: 'c', text: 'Only for family.', text_vi: 'Chỉ cho gia đình.' },
                  { id: 'd', text: 'To avoid answering.', text_vi: 'Để tránh trả lời.' },
                ],
                answer: 'b',
                explanation_en: 'Acknowledging their need shows empathy — they feel heard before hearing the difficult answer.',
                explanation_vi: 'Thừa nhận nhu cầu của họ thể hiện đồng cảm — họ cảm thấy được lắng nghe trước khi nghe câu trả lời khó.',
              },
              {
                id: 'm12l3q3',
                type: 'mcq',
                prompt_en: 'When you cannot answer a prognosis question, what should you do?',
                prompt_vi: 'Khi bạn không thể trả lời câu hỏi tiên lượng, bạn nên làm gì?',
                options: [
                  { id: 'a', text: 'Make up an answer.', text_vi: 'Bịa câu trả lời.' },
                  { id: 'b', text: 'Be honest about uncertainty, offer to get the doctor, and offer practical support.', text_vi: 'Thành thật về không chắc chắn, đề nghị gọi bác sĩ, và đề nghị hỗ trợ thực tế.' },
                  { id: 'c', text: 'Say nothing.', text_vi: 'Không nói gì.' },
                  { id: 'd', text: 'Leave the room.', text_vi: 'Rời khỏi phòng.' },
                ],
                answer: 'b',
                explanation_en: 'Honesty + signposting to doctor + support — this is the professional approach.',
                explanation_vi: 'Chân thật + hướng đến bác sĩ + hỗ trợ — đây là cách tiếp cận chuyên nghiệp.',
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
      title: 'Discussing CPR and Resuscitation Decisions',
      title_vi: 'Thảo luận Quyết định CPR và Hồi sức',
      description: 'The team needs to discuss resuscitation status with the family. Learn the language for these difficult conversations.',
      description_vi: 'Đội cần thảo luận tình trạng hồi sức với gia đình. Học ngôn ngữ cho những cuộc trò chuyện khó này.',
      stage: 'heads_down',
      order_index: 4,
      est_minutes: 15,
      objective: 'Apply family communication language for CPR discussions.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'Ward — CPR Decision Discussion',
          title_vi: 'Khoa — Thảo luận Quyết định CPR',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'Ward — Family Meeting Room',
            setting_vi: 'Khoa — Phòng Họp Gia đình',
            context_en: 'Mrs. Park is very ill. The doctor has asked you to support a family meeting to discuss whether to attempt CPR if her heart stops. The family is confused and frightened. You need to support the conversation and use clear, honest language.',
            context_vi: 'Bà Park rất nặng. Bác sĩ đã yêu cầu bạn hỗ trợ cuộc họp gia đình để thảo luận có nên thử CPR nếu tim bà ngừng. Gia đình bối rối và sợ hãi. Bạn cần hỗ trợ cuộc trò chuyện và dùng ngôn ngữ rõ ràng, chân thật.',
            key_phrases: [
              { en: 'I have some difficult news to share.', vi: 'Tôi có tin khó nói cần chia sẻ.' },
              { en: 'We did everything we could.', vi: 'Chúng tôi đã làm mọi thứ có thể.' },
              { en: 'His condition has become very serious.', vi: 'Tình trạng của ông ấy đã trở nên rất nghiêm trọng.' },
              { en: 'I cannot give a certainty, but I want to be honest with you.', vi: 'Tôi không thể đưa ra chắc chắn, nhưng tôi muốn thành thật với bạn.' },
              { en: 'Is there someone you would like us to call?', vi: 'Có ai bạn muốn chúng tôi gọi không?' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec family room — quiet, solemn. No dialogue. Mood: difficult conversation ahead.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Supports CPR Discussion',
          title_vi: 'Nghe: Điều dưỡng Hỗ trợ Thảo luận CPR',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Doctor: We need to talk about what happens if your mother's heart stops. I have some difficult news to share. Her condition has become very serious.\nNurse Linh: The doctor will explain the options. I cannot give a certainty, but I want to be honest with you. We did everything we could to help her so far. Is there someone you would like us to call? It can help to have family here for this discussion.\nDaughter: Yes. My brother. He should be here.\nNurse Linh: Of course. We will call him. Take your time. The doctor is here to answer your questions.",
            _instructions: 'AUDIO PRODUCER: Three speakers — Doctor (explaining), Nurse Linh (supporting, compassionate), Daughter (upset). Family room. Duration: 38-42 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the CPR Discussion',
          title_vi: 'Đọc Thảo luận CPR',
          order_index: 3,
          config: {
            script: "Doctor: I have some difficult news to share. Her condition has become very serious. We need to talk about what happens if her heart stops.\nNurse: I cannot give a certainty, but I want to be honest with you. We did everything we could. Is there someone you would like us to call?\nDaughter: Yes. My brother. He should be here.\nNurse: Of course. We will call him.",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the CPR Discussion',
          title_vi: 'Hoàn thành Thảo luận CPR',
          order_index: 4,
          config: {
            cloze: "Doctor: I have some ___ news to share. Her ___ has become very ___. We need to talk about what happens if her heart ___.\nNurse: I cannot give a ___, but I want to be ___ with you. We did everything we ___. Is there someone you would like us to ___?\nNurse: Of course. We will ___ him.",
            script: "Doctor: I have some difficult news to share. Her condition has become very serious. We need to talk about what happens if her heart stops.\nNurse: I cannot give a certainty, but I want to be honest with you. We did everything we could. Is there someone you would like us to call?\nNurse: Of course. We will call him.",
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 5 — HEADS DOWN  (audio_shadow → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Supporting Grieving Families',
      title_vi: 'Hỗ trợ Gia đình Đau buồn',
      description: 'A patient has died. Learn to support the family in the first moments. Practice and record yourself.',
      description_vi: 'Bệnh nhân đã qua đời. Học cách hỗ trợ gia đình trong những khoảnh khắc đầu tiên. Thực hành và ghi âm.',
      stage: 'heads_down',
      order_index: 5,
      est_minutes: 18,
      objective: 'Deliver family support language independently.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Supports Grieving Family',
          title_vi: 'Nghe: Điều dưỡng Hỗ trợ Gia đình Đau buồn',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Anh: Please sit down. I have some difficult news to share. I am so sorry. We did everything we could. His condition had become very serious. He passed away peacefully. I cannot give a certainty about why, but I want to be honest with you. The doctor will come to speak with you. Is there someone you would like us to call? Would you like to sit with him? Take your time. We are here for you.",
            _instructions: 'AUDIO PRODUCER: One main speaker — Nurse Anh (gentle, compassionate). Brief family response. Quiet room. Duration: 38-42 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'cloze',
          title: 'Build the Grief Support Dialogue',
          title_vi: 'Xây dựng Hội thoại Hỗ trợ Đau buồn',
          order_index: 2,
          config: {
            cloze: "Nurse: I have some ___ news to share. I am so ___. We did everything we ___. His ___ had become very serious. He passed away ___.\nI cannot give a ___, but I want to be ___ with you. The doctor will come to ___ with you. Is there someone you would like us to ___? Would you like to ___ with him?",
            script: "Nurse: I have some difficult news to share. I am so sorry. We did everything we could. His condition had become very serious. He passed away peacefully.\nI cannot give a certainty, but I want to be honest with you. The doctor will come to speak with you. Is there someone you would like us to call? Would you like to sit with him?",
          },
        },
        {
          type: 'no_script',
          title: 'Speak It — No Script',
          title_vi: 'Nói — Không Kịch bản',
          order_index: 3,
          config: {
            context: 'You need to inform a family that their relative has died. Use the key phrases compassionately.',
            cues: [
              '"I have some difficult news to share"',
              '"We did everything we could"',
              '"His/Her condition had become very serious"',
              '"I cannot give a certainty, but I want to be honest with you"',
              '"Is there someone you would like us to call?"',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Family Support',
          title_vi: 'Ghi âm Hỗ trợ Gia đình của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself informing a family of difficult news or supporting a grieving family. Use at least four key phrases from this module.',
            prompt_vi: 'Ghi âm bạn thông báo tin khó cho gia đình hoặc hỗ trợ gia đình đau buồn. Sử dụng ít nhất bốn cụm từ chính từ module này.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself. Include: "I have some difficult news to share", "We did everything we could", "His/Her condition has become very serious", "I cannot give a certainty, but I want to be honest with you", "Is there someone you would like us to call?" Aim for 35-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 6 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Nurse to Family: Breaking Bad News',
      title_vi: 'Luyện tập Cặp — Điều dưỡng đến Gia đình: Thông báo Tin Xấu',
      description: 'Work with a partner. One plays the nurse, one plays the family member. Practice breaking difficult news.',
      description_vi: 'Làm việc với đối tác. Một người đóng vai điều dưỡng, một người đóng vai người nhà. Thực hành thông báo tin khó.',
      stage: 'heads_together',
      order_index: 6,
      est_minutes: 20,
      objective: 'Practice breaking bad news with a partner.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Nurse Breaks Bad News',
          title_vi: 'Kịch bản Đầy đủ — Điều dưỡng Thông báo Tin Xấu',
          order_index: 1,
          config: {
            script: "Nurse: Please sit down. I have some difficult news to share. Your wife's condition has become very serious. We did everything we could. I cannot give a certainty, but I want to be honest with you. The doctor will come to speak with you shortly. Is there someone you would like us to call? Would you like to sit with her?\nHusband: Yes. And my son. Please call my son.\nNurse: Of course. We will call him. Take your time. I am here if you need anything.",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Nurse: I have some ___ news to share. Your wife's ___ has become very ___. We did everything we ___.\nI cannot give a ___, but I want to be ___ with you. The doctor will come ___. Is there someone you would like us to ___?\nNurse: Of course. We will ___ him. Take your ___.",
            script: "Nurse: I have some difficult news to share. Your wife's condition has become very serious. We did everything we could.\nI cannot give a certainty, but I want to be honest with you. The doctor will come shortly. Is there someone you would like us to call?\nNurse: Of course. We will call him. Take your time.",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Break difficult news (deterioration or death). Nurse B: Play the family member. Switch roles.',
            cues: [
              '"I have some difficult news to share"',
              '"We did everything we could"',
              '"His/Her condition has become very serious"',
              '"I cannot give a certainty, but I want to be honest with you"',
              '"Is there someone you would like us to call?"',
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
            prompt_en: 'Record your best performance as the nurse breaking difficult news to a family.',
            prompt_vi: 'Ghi âm phần trình diễn tốt nhất của bạn với vai điều dưỡng thông báo tin khó cho gia đình.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'PAIR PRACTICE: Complete all three rounds. Submit ONE recording — your best as the nurse. Include at least three key family communication phrases. Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 7 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Managing Information Requests During Treatment',
      title_vi: 'Luyện tập Cặp — Quản lý Yêu cầu Thông tin Trong Điều trị',
      description: 'A family member demands information while the team is still treating the patient. Practice managing this professionally.',
      description_vi: 'Người nhà yêu cầu thông tin trong khi đội vẫn đang điều trị bệnh nhân. Thực hành quản lý điều này chuyên nghiệp.',
      stage: 'heads_together',
      order_index: 7,
      est_minutes: 20,
      objective: 'Practice managing family information requests with a partner.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Nurse Manages Family During Resus',
          title_vi: 'Kịch bản Đầy đủ — Điều dưỡng Quản lý Gia đình Trong Hồi sức',
          order_index: 1,
          config: {
            script: "Family: What is happening? Is he alive? I need to know!\nNurse: I understand you need to know. The team is with him now. I cannot give a certainty, but I want to be honest with you. We did everything we could. The doctor will come to speak with you as soon as possible. Is there someone you would like us to call? Please wait here. I will update you as soon as I can.",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Family: What is ___? Is he ___? I need to know!\nNurse: I understand you need to ___. The team is with him ___. I cannot give a ___, but I want to be ___ with you. We did everything we ___. The doctor will come ___. Is there someone you would like us to ___?",
            script: "Family: What is happening? Is he alive? I need to know!\nNurse: I understand you need to know. The team is with him now. I cannot give a certainty, but I want to be honest with you. We did everything we could. The doctor will come to speak with you. Is there someone you would like us to call?",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Manage family demanding information during active treatment. Nurse B: Play the family member. Switch roles.',
            cues: [
              '"I understand you need to know"',
              '"I cannot give a certainty, but I want to be honest with you"',
              '"We did everything we could"',
              '"The doctor will come to speak with you"',
              '"Is there someone you would like us to call?"',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Family Management',
          title_vi: 'Ghi âm Quản lý Gia đình của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself managing a family member who is demanding information during active treatment.',
            prompt_vi: 'Ghi âm bạn quản lý người nhà đang yêu cầu thông tin trong khi điều trị đang diễn ra.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself. Include: "I understand you need to know", "I cannot give a certainty, but I want to be honest with you", "We did everything we could", "The doctor will come to speak with you", "Is there someone you would like us to call?" Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 8 — ASSESSMENT  (quiz → cloze → recording_submit → self_reflection)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Module Assessment — Family Communication & Self-Reflection',
      title_vi: 'Kiểm tra Module — Giao tiếp Gia đình & Tự Phản ánh',
      description: 'A comprehensive assessment of family communication in emergencies. Finish by reflecting on what you have learned.',
      description_vi: 'Đánh giá toàn diện về giao tiếp gia đình trong cấp cứu. Kết thúc bằng phản ánh những gì bạn đã học.',
      stage: 'assessment',
      order_index: 8,
      est_minutes: 25,
      objective: 'Demonstrate Module 12 family communication language.',
      steps: [
        {
          type: 'quiz',
          title: 'Module 12 Knowledge Check',
          title_vi: 'Kiểm tra Kiến thức Module 12',
          order_index: 1,
          config: {
            questions: [
              {
                id: 'm12l8q1',
                type: 'mcq',
                prompt_en: '[Part A — Vocabulary] "I have some difficult news to share" — what does this achieve?',
                prompt_vi: '[Phần A — Từ vựng] "I have some difficult news to share" — đạt được gì?',
                options: [
                  { id: 'a', text: 'It delays the conversation.', text_vi: 'Nó trì hoãn cuộc trò chuyện.' },
                  { id: 'b', text: 'It prepares the family emotionally — signals that what follows will be hard to hear.', text_vi: 'Nó chuẩn bị tâm lý gia đình — báo hiệu điều tiếp theo sẽ khó nghe.' },
                  { id: 'c', text: 'Only for death.', text_vi: 'Chỉ cho tử vong.' },
                  { id: 'd', text: 'To avoid responsibility.', text_vi: 'Để tránh trách nhiệm.' },
                ],
                answer: 'b',
                explanation_en: 'This "warning shot" phrase helps family brace before hearing difficult news.',
                explanation_vi: 'Cụm từ "cảnh báo" này giúp gia đình chuẩn bị trước khi nghe tin khó.',
              },
              {
                id: 'm12l8q2',
                type: 'mcq',
                prompt_en: '[Part B — Protocol] "We did everything we could" — when do you say this?',
                prompt_vi: '[Phần B — Quy trình] "We did everything we could" — khi nào bạn nói?',
                options: [
                  { id: 'a', text: 'Only when the patient died.', text_vi: 'Chỉ khi bệnh nhân đã chết.' },
                  { id: 'b', text: 'When the team has tried their best — after resuscitation, or when explaining deterioration. Acknowledges effort.', text_vi: 'Khi đội đã cố gắng hết sức — sau hồi sức, hoặc khi giải thích xấu đi. Thừa nhận nỗ lực.' },
                  { id: 'c', text: 'To blame the family.', text_vi: 'Để đổ lỗi gia đình.' },
                  { id: 'd', text: 'Only for doctors.', text_vi: 'Chỉ cho bác sĩ.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase acknowledges team effort — important for family to hear that nothing was left undone.',
                explanation_vi: 'Cụm từ này thừa nhận nỗ lực đội — quan trọng để gia đình biết không có gì bỏ sót.',
              },
              {
                id: 'm12l8q3',
                type: 'mcq',
                prompt_en: '[Part C — Communication] "I cannot give a certainty, but I want to be honest with you" — why use this?',
                prompt_vi: '[Phần C — Giao tiếp] "I cannot give a certainty, but I want to be honest with you" — tại sao dùng?',
                options: [
                  { id: 'a', text: 'To avoid answering.', text_vi: 'Để tránh trả lời.' },
                  { id: 'b', text: 'To acknowledge uncertainty while building trust — honest in difficult situations.', text_vi: 'Để thừa nhận không chắc chắn trong khi xây dựng lòng tin — chân thật trong tình huống khó.' },
                  { id: 'c', text: 'Only for prognosis.', text_vi: 'Chỉ cho tiên lượng.' },
                  { id: 'd', text: 'The nurse does not know.', text_vi: 'Điều dưỡng không biết.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase balances honesty with humility — you cannot predict, but you are not hiding.',
                explanation_vi: 'Cụm từ này cân bằng chân thật với khiêm tốn — bạn không thể dự đoán, nhưng bạn không che giấu.',
              },
              {
                id: 'm12l8q4',
                type: 'mcq',
                prompt_en: '[Part D — Decision] A family member asks "Will they survive?" during active resuscitation. You should:',
                prompt_vi: '[Phần D — Quyết định] Người nhà hỏi "Họ có sống được không?" trong khi hồi sức đang diễn ra. Bạn nên:',
                options: [
                  { id: 'a', text: 'Say "Yes, they will be fine."', text_vi: 'Nói "Có, họ sẽ ổn."' },
                  { id: 'b', text: 'Acknowledge their need, be honest about uncertainty, offer to get the doctor, and offer practical support.', text_vi: 'Thừa nhận nhu cầu của họ, thành thật về không chắc chắn, đề nghị gọi bác sĩ, và đề nghị hỗ trợ thực tế.' },
                  { id: 'c', text: 'Say "I cannot tell you anything."', text_vi: 'Nói "Tôi không thể nói gì với bạn."' },
                  { id: 'd', text: 'Walk away.', text_vi: 'Bỏ đi.' },
                ],
                answer: 'b',
                explanation_en: 'Acknowledge + honesty + signpost to doctor + support — professional approach to impossible questions.',
                explanation_vi: 'Thừa nhận + chân thật + hướng đến bác sĩ + hỗ trợ — cách tiếp cận chuyên nghiệp với câu hỏi không thể trả lời.',
              },
            ],
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Full Family Communication',
          title_vi: 'Hoàn thành Giao tiếp Gia đình Đầy đủ',
          order_index: 2,
          config: {
            cloze: "Nurse: I have some ___ news to share. [His/Her] ___ has become very ___. We did everything we ___.\nI cannot give a ___, but I want to be ___ with you. The doctor will come to ___ with you.\nIs there someone you would like us to ___? Would you like to ___ with [him/her]?",
            script: "Nurse: I have some difficult news to share. [His/Her] condition has become very serious. We did everything we could.\nI cannot give a certainty, but I want to be honest with you. The doctor will come to speak with you.\nIs there someone you would like us to call? Would you like to sit with [him/her]?",
          },
        },
        {
          type: 'recording_submit',
          title: 'Final Assessment Recording',
          title_vi: 'Ghi âm Đánh giá Cuối cùng',
          order_index: 3,
          config: {
            prompt_en: 'Record yourself communicating difficult news to a family. Use all five key phrases from this module.',
            prompt_vi: 'Ghi âm bạn truyền đạt tin khó cho gia đình. Sử dụng cả năm cụm từ chính từ module này.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: '[FINAL ASSESSMENT] You are Nurse [Your Name]. Communicate difficult news (deterioration or death) to a family. Include: "I have some difficult news to share", "We did everything we could", "His/Her condition has become very serious", "I cannot give a certainty, but I want to be honest with you", "Is there someone you would like us to call?" Aim for 40-50 seconds.',
          },
        },
        {
          type: 'self_reflection',
          title: 'Module 12 Self-Reflection',
          title_vi: 'Tự Phản ánh Module 12',
          order_index: 4,
          config: {
            prompts: [
              { key: 'confidence', type: 'slider', label_en: 'How confident do you feel communicating with families in difficult situations in English now?', label_vi: 'Bạn cảm thấy tự tin giao tiếp với gia đình trong tình huống khó bằng tiếng Anh chưa?' },
              { key: 'usefulness', type: 'slider', label_en: 'How useful was this module for your real clinical work?', label_vi: 'Module này có hữu ích cho công việc lâm sàng thực tế của bạn không?' },
              { key: 'difficulty', type: 'slider', label_en: 'How difficult was the family communication language in this module?', label_vi: 'Ngôn ngữ giao tiếp gia đình trong module này khó ở mức độ nào?' },
              { key: 'pair_helped', type: 'slider', label_en: 'Did the pair practice (Lessons 6 and 7) help you feel more prepared?', label_vi: 'Luyện tập cặp đôi (Bài 6 và 7) có giúp bạn cảm thấy sẵn sàng hơn không?' },
              { key: 'open_feedback', type: 'text', label_en: 'Which family communication phrase will you try to use on your next shift?', label_vi: 'Bạn sẽ thử dùng cụm từ giao tiếp gia đình nào trong ca làm tiếp theo?' },
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
