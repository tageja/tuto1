/**
 * Pre-written animation scripts for all conversation_animation steps.
 * Keyed by lessonTitle + stepTitle (case-insensitive partial match).
 * Used as fallback when a step has no existing config.lines / config.script.
 */

export interface ScriptEntry {
  /** Partial match against lesson title (case-insensitive) */
  lessonMatch: string
  /** Partial match against step title (case-insensitive) */
  stepMatch: string
  sceneSetting: string
  script: string
}

export const ANIMATION_SCRIPTS: ScriptEntry[] = [

  // ─── MODULE 1: First Contact in an Emergency ───────────────────────────────

  {
    lessonMatch: "what's happening",
    stepMatch: 'read',
    sceneSetting: 'Emergency triage desk',
    script: `nurse: Good evening! I'm Nurse Linh. Can you tell me what's happening?
patient: I fell — I think I hurt my arm badly. It's really painful.
nurse: Okay, stay calm. Where exactly does it hurt? Can you point to it?
patient: Here — my wrist and forearm. I can't move it.
nurse: I can see that. I'm going to support your arm now and check for any swelling.
patient: Please be careful — it's very sore when I move it.
nurse: I'll be as gentle as I can. Does the pain go anywhere else, like up to your shoulder?
patient: No, just the arm. But I feel a bit dizzy too.
nurse: That's important to know. Have you hit your head at all when you fell?
patient: I don't think so. I landed on my arm to catch myself.
nurse: Good. I'm going to call the doctor now. You're in the right place — we'll take care of you.`,
  },

  {
    lessonMatch: 'key phrases in action',
    stepMatch: 'read along',
    sceneSetting: 'A&E bay',
    script: `nurse: Good morning! What brings you into A&E today?
patient: I've had chest pain since this morning. It keeps coming and going.
nurse: I see. Can you describe the pain for me? Is it sharp, dull, or like a pressure?
patient: More like a pressure. It's making me feel quite breathless too.
nurse: Has this happened before, or is this the first time?
patient: First time. I got scared so my husband drove me here straight away.
nurse: You did the right thing coming in. I'm going to check your pulse and oxygen levels now.
patient: Is it serious? I'm really worried.
nurse: We're going to find out exactly what's going on. Just try to stay calm — you're safe here.
patient: Okay. Thank you, nurse.`,
  },

  {
    lessonMatch: 'three-person dialogue',
    stepMatch: 'read',
    sceneSetting: 'Hospital entrance',
    script: `nurse: Good afternoon — I'm Nurse Linh. What's happened here?
patient: I was walking in and I suddenly felt faint. My legs just gave way.
family: I caught him before he hit the floor. He's been feeling unwell all day.
nurse: Thank you for helping him. Sir, are you still feeling faint right now?
patient: A little. My vision went blurry for a moment but it's clearing.
nurse: When did you last eat or drink anything?
patient: Breakfast — that's all. About eight hours ago.
family: He's been rushing all day. He didn't want to stop.
nurse: That could be contributing. I'm going to get a wheelchair and check his blood pressure immediately.
patient: I feel embarrassed — I'm usually fine.
nurse: Please don't be. This happens and we're here to help. Can you tell me if you have any medical conditions?
family: He's diabetic. He has insulin at home but I don't know if he took it today.
nurse: That's very helpful information, thank you. We need to check his blood sugar straight away.`,
  },

  {
    lessonMatch: 'pair practice',
    stepMatch: 'round 1',
    sceneSetting: 'Triage desk',
    script: `nurse: Hello, I'm Nurse Linh. What's brought you in tonight?
patient: I have a terrible headache — the worst one I've ever had. It started suddenly.
nurse: When you say sudden, how fast did it come on?
patient: Like a thunderclap. Within seconds it was unbearable.
nurse: I need you to stay very still. Does your neck feel stiff or painful to move?
patient: Yes, a little. Is that bad?
nurse: It's important information. Have you had any vomiting or sensitivity to light?
patient: Yes — the lights in here are hurting my eyes. I had to vomit twice on the way here.
nurse: I'm going to fast-track you to be seen by the doctor right away. Please don't move unnecessarily.
patient: You're scaring me. What do you think it is?
nurse: I can't diagnose, but I want you seen immediately as a precaution. You're in the right hands.`,
  },

  // ─── MODULE 2: Triage Intake ───────────────────────────────────────────────

  {
    lessonMatch: 'asking the right questions',
    stepMatch: 'read the triage',
    sceneSetting: 'Triage desk',
    script: `nurse: Good morning. I'm Nurse Linh — I'll be doing your triage today. What's your main problem?
patient: I have pain in my stomach. It started last night and it's getting worse.
nurse: On a scale of one to ten, with ten being the worst pain you can imagine, how would you rate it?
patient: About a seven or eight right now.
nurse: Where exactly is the pain? Can you point to it?
patient: Here — on the right side, lower down.
nurse: Has the pain moved at all since it started? Does it go anywhere else?
patient: It started in the middle and moved to the right side.
nurse: Have you had any fever, nausea, or vomiting?
patient: Yes — I vomited twice last night and I feel hot.
nurse: Thank you. I'm going to check your temperature and pulse now. This information is very important.`,
  },

  {
    lessonMatch: 'back injury',
    stepMatch: 'read',
    sceneSetting: 'Triage assessment area',
    script: `nurse: Hello, I'm Nurse Linh. I understand you've had a fall — can you tell me what happened?
patient: I slipped on the wet floor at work and fell backwards. My back hit the edge of a step.
nurse: I'm sorry to hear that. Can you walk without help, or are you having trouble?
patient: I walked in but it's very painful. My lower back is really bad.
nurse: Are you having any pain, tingling, or numbness in your legs or feet?
patient: My right leg feels a bit strange — a tingling sensation.
nurse: That's important. Have you had any difficulty controlling your bladder or bowel since the fall?
patient: No — nothing like that. Just the back pain and the leg tingling.
nurse: I need you to stay as still as possible while I arrange an examination. Don't try to twist or bend.
patient: Okay. Is it serious?
nurse: We need to assess you properly. The most important thing right now is to keep you comfortable and safe.`,
  },

  {
    lessonMatch: 'describing symptoms',
    stepMatch: 'read along',
    sceneSetting: 'A&E bay',
    script: `nurse: Can you describe the pain for me? What does it feel like?
patient: It's like a burning sensation — it goes from my chest down to my stomach.
nurse: Is it constant, or does it come and go?
patient: It comes and goes. Worse when I swallow.
nurse: Does anything make it better or worse? For example, lying down or eating?
patient: Lying down makes it much worse. And spicy food triggers it.
nurse: Have you experienced this kind of pain before?
patient: Yes, but never this bad. Last time it went away on its own.
nurse: How long has today's pain been going on?
patient: About three hours now. I took antacids but it didn't help this time.
nurse: I'll make a note of all of this. The doctor will want to examine you soon.`,
  },

  {
    lessonMatch: 'pair triage',
    stepMatch: 'full pair',
    sceneSetting: 'Triage desk',
    script: `nurse: Good afternoon, I'm Nurse Linh. What's brought you in today?
patient: I've been having palpitations — my heart is beating really fast and irregularly.
nurse: How long has this been happening?
patient: On and off for two days, but right now it's constant. About four hours.
nurse: Do you feel short of breath, dizzy, or have any chest pain alongside the palpitations?
patient: A little dizzy. No chest pain, but I feel very anxious.
nurse: Have you ever had this happen before? Any diagnosed heart conditions?
patient: I had an irregular heartbeat diagnosed two years ago. I take medication for it.
nurse: What medication are you on, and did you take it today?
patient: Metoprolol — yes, I took it this morning.
nurse: Okay. I'm going to do an ECG right now. Please sit here and try to stay calm.`,
  },

  // ─── MODULE 3: Immediate Instructions in Emergencies ──────────────────────

  {
    lessonMatch: 'safety first',
    stepMatch: 'read the trauma',
    sceneSetting: 'Trauma bay',
    script: `nurse: Sir, I need you to stay completely still — do not move your leg. Can you hear me?
patient: Yes — yes, I can. It hurts so much. What happened?
nurse: You've been in an accident. We're looking after you now. I need you to keep very still.
patient: I want to get up — I need to see my leg!
nurse: I understand, but please don't move. Moving could make your injury worse. Trust me.
patient: Okay — okay. I'll stay still.
nurse: Good. I'm going to check your circulation in your leg now. You may feel some pressure.
patient: Is it bad? Please tell me honestly.
nurse: Your leg is injured and we're treating it right now. The most important thing is keeping you still and calm.
patient: My family — can someone call my family?
nurse: We'll do that as soon as we have you stabilised. Right now focus on breathing slowly with me.`,
  },

  {
    lessonMatch: 'confused elderly',
    stepMatch: 'read',
    sceneSetting: 'Ward corridor',
    script: `nurse: Hello there. I'm Nurse Linh. What's your name?
patient: I... I need to go. I have to get home. My children are waiting.
nurse: You're safe here. This is the hospital. Can I help you back to your room?
patient: Hospital? No — I don't need to be here. Let me go.
nurse: I understand you want to go home. Can you tell me your name so I can help you?
patient: My name? It's... I can't remember right now. I'm confused.
nurse: That's okay — don't worry about that. I'm going to walk with you. Hold my arm if you'd like.
patient: Where are you taking me?
nurse: Just somewhere comfortable and safe. Are you in any pain right now?
patient: My head hurts a little. And I'm tired.
nurse: Let's get you sitting down and I'll get the doctor to check on you. You're not in any trouble.`,
  },

  {
    lessonMatch: 'more critical instructions',
    stepMatch: 'read',
    sceneSetting: 'A&E bay',
    script: `nurse: Mrs. Tran, I need you to stay awake for me. Can you open your eyes?
patient: I'm so tired... I just want to sleep.
nurse: I know you're tired, but I need you to stay with me. Can you squeeze my hand?
patient: Okay... like this?
nurse: Yes! Good. That's really good. What's today's date — do you know?
patient: I... Thursday? I'm not sure. Everything feels foggy.
nurse: That's okay. Keep squeezing my hand. The doctor is on the way right now.
patient: Am I going to be alright?
nurse: We're doing everything we can for you. You're responding well. Keep your eyes open for me.
patient: I'll try. It's hard to stay awake.
nurse: I know. You're doing brilliantly. Talk to me — tell me something. What's your favourite food?`,
  },

  // ─── MODULE 4: Common Emergency Scenarios ─────────────────────────────────

  {
    lessonMatch: 'chest pain',
    stepMatch: 'read the cardiac',
    sceneSetting: 'Emergency triage',
    script: `nurse: Sir, I'm Nurse Linh. You're having chest pain — when did it start?
patient: About thirty minutes ago. It came on while I was walking up the stairs.
nurse: On a scale of one to ten, how severe is the pain right now?
patient: Eight. It's like something heavy is sitting on my chest.
nurse: Does the pain go anywhere — your arm, jaw, or back?
patient: Yes — down my left arm. And my jaw feels strange too.
nurse: Are you sweating or feeling nauseous?
patient: Both. I feel very sick and I'm sweating a lot.
nurse: I'm placing you on a monitor immediately and calling the doctor. This is our highest priority.
patient: Is it a heart attack?
nurse: We're checking that right now. Don't move — I'm staying right here with you.`,
  },

  {
    lessonMatch: 'dual emergency',
    stepMatch: 'read',
    sceneSetting: 'A&E resus bay',
    script: `nurse: Ma'am, you've come in with breathing difficulties and a deep cut on your arm — which is more painful right now?
patient: I can't... breathe properly. The arm hurts but the breathing is scaring me more.
nurse: Focus on me. I'm going to put an oxygen mask on your face now — it'll help straight away.
patient: Okay... okay. But my arm — there's so much blood.
nurse: I see it — my colleague is applying pressure to your arm. You have two of us here.
patient: I feel dizzy. I think I might faint.
nurse: Stay with me. Breathe in slowly through the mask. In... and out. That's it.
patient: It's helping a little. The oxygen is helping.
nurse: Good. Keep breathing. We're sorting both problems at once — you're in safe hands.
patient: Thank you. I was so scared.
nurse: You're doing really well. The doctor will be here in under a minute.`,
  },

  {
    lessonMatch: 'bleeding and trauma',
    stepMatch: 'read',
    sceneSetting: 'A&E bay',
    script: `nurse: I can see there's a significant wound on your forearm. Can you tell me how this happened?
patient: I cut it on broken glass. It won't stop bleeding.
nurse: I'm applying firm pressure now — this may feel uncomfortable but it's important. How long has it been bleeding?
patient: About twenty minutes. I held a cloth on it but it soaked through.
nurse: Has this ever happened before — any bleeding disorders that you know of?
patient: No, nothing like that. I'm on blood thinners though — for a clot I had last year.
nurse: That's very important information, thank you. Are you allergic to any medications or local anaesthetic?
patient: Not that I know of.
nurse: We may need to close this wound with stitches. The doctor will assess it. Are you feeling lightheaded?
patient: A bit. I don't like the sight of blood.
nurse: Look away from the wound — look at me. I'll talk you through everything we do.`,
  },

  // ─── MODULE 5: Patient Deterioration & Escalation ─────────────────────────

  {
    lessonMatch: "vital signs",
    stepMatch: 'read the escalation',
    sceneSetting: 'Emergency ward',
    script: `nurse: Mr. Brown, I'm checking your observations. Your blood pressure has dropped since the last reading.
patient: I do feel worse than before. More breathless.
nurse: Your oxygen saturation is also lower. I need to ask — are you on any blood pressure medication?
patient: Yes — two types. I took them this morning.
nurse: And have you eaten or had much to drink today?
patient: Not really. I feel too unwell to eat.
nurse: I'm going to increase your oxygen flow now and call the senior doctor. This is a priority review.
patient: Something feels wrong. I'm scared.
nurse: I know, and I'm not leaving your side. Your numbers are telling us you need extra support right now.
patient: Please call my wife.
nurse: I will — as soon as the doctor arrives. I promise.`,
  },

  {
    lessonMatch: 'respiratory deterioration',
    stepMatch: 'read',
    sceneSetting: 'Post-op ward',
    script: `nurse: Mrs. Le, I'm doing your check. You look like you're working harder to breathe than before.
patient: Yes... it's getting more difficult. I feel very tight in my chest.
nurse: Your respiratory rate is twenty-eight — that's elevated. When did the tightness start?
patient: After I came back from my scan. Maybe one hour ago.
nurse: Have you had any sharp pain when breathing in?
patient: Yes — on the right side. Sharp when I breathe deeply.
nurse: I'm putting extra oxygen on you now and alerting the doctor. Don't try to talk too much.
patient: Is something wrong with my lungs?
nurse: I can't say yet, but your symptoms need to be assessed urgently. Just focus on breathing slowly.
patient: Okay. I'll try.
nurse: You're doing well. Stay calm — help is coming now.`,
  },

  // ─── MODULE 6: Reassurance Under Pressure ─────────────────────────────────

  {
    lessonMatch: 'calming a panicking',
    stepMatch: 'read the reassurance',
    sceneSetting: 'A&E bay',
    script: `nurse: Hey — look at me. Just look at me. I'm Nurse Linh. You're safe.
patient: I can't breathe! I can't breathe! Something is wrong with me!
nurse: I hear you. You're breathing — I can see your chest moving. Let's slow it down together.
patient: I feel like I'm dying. My heart is racing.
nurse: I know it feels that way. But you're here, you're safe, and I'm right beside you. Can you try to breathe with me?
patient: I'll try... in and out?
nurse: In... slowly... and out. That's it. In... and out. Your heart rate is coming down.
patient: It's a little better. But I'm still scared.
nurse: That's okay. Fear is normal. You don't need to feel better straight away. I'm not going anywhere.
patient: What's wrong with me?
nurse: The doctor will explain everything soon. For now, all you need to do is breathe with me.`,
  },

  {
    lessonMatch: 'distressed relative',
    stepMatch: 'read the de-escalation',
    sceneSetting: 'Ward corridor',
    script: `nurse: I can see you're very upset — please come with me to sit down. I'm Nurse Linh.
family: No one is telling me anything! How is my father? What's happening to him?
nurse: I completely understand how frightening this is. Let me find a quiet place and explain everything.
family: Why can't I see him? Why won't anyone let me in?
nurse: The team is working with him right now to stabilise him. That's why we need the space.
family: Is he going to be okay? Please just tell me.
nurse: I can't give you a prognosis right now, but I can tell you the best team is with him.
family: I've been waiting for two hours. No one has spoken to me.
nurse: That should not have happened and I apologise. I'm speaking to you now and I won't leave until you have answers.
family: Thank you. I just... I'm so scared.
nurse: I know. That's completely understandable. Let's sit together and I'll get you an update within ten minutes. I promise.`,
  },

  {
    lessonMatch: 'anxious family',
    stepMatch: 'read the family',
    sceneSetting: 'ICU entrance',
    script: `nurse: Hello, I'm Nurse Linh from the ICU team. Are you here for a patient?
family: Yes — my mother. She was brought in an hour ago. No one will tell us anything.
nurse: I'm so sorry for the wait. Can I take your mother's name so I can check on her status?
family: Nguyen Thi Hoa. She had a stroke.
nurse: Thank you. I'll check her notes now. Are there other family members here?
family: My brother and my aunt. We're all terrified.
nurse: That's completely natural. I'll get an update from the treating team and come back to you directly.
family: Is she conscious? Can she recognise us?
nurse: I want to give you accurate information rather than guess. I'll have news for you in five minutes.
family: Please — we just need to know she's alive and being looked after.
nurse: She is being looked after by our best team. I'll bring you to a quiet room and come back with the doctor.`,
  },

  // ─── MODULE 7: Red Flags & Escalation ─────────────────────────────────────

  {
    lessonMatch: 'code blue',
    stepMatch: 'read the code blue',
    sceneSetting: 'General ward',
    script: `nurse: Doctor Chen — this is Nurse Linh from Ward 4. I'm calling a Code Blue on bed 6.
doctor: I'm on my way. Tell me what you have.
nurse: Mr. Park, sixty-two years old, post-cardiac surgery day two. He's unresponsive, no palpable pulse, not breathing normally.
doctor: Have you started CPR?
nurse: Yes — CPR is in progress. AED is attached. First shock delivered two minutes ago. No return of spontaneous circulation.
doctor: Any change in rhythm on the monitor?
nurse: He went from sinus rhythm to ventricular fibrillation at fourteen thirty-two. Now showing fine VF.
doctor: Continue CPR. Prepare adrenaline one milligram IV. I'll be there in ninety seconds.
nurse: Understood. Adrenaline drawn up. IV access confirmed. Family has been moved to the relatives room.
doctor: Good work Nurse Linh. Keep the line open.`,
  },

  {
    lessonMatch: 'sepsis',
    stepMatch: 'read the sepsis',
    sceneSetting: 'Ward bed',
    script: `nurse: Mrs. Park, I'm Nurse Linh. I'm concerned about how you're feeling. Can you tell me your name?
patient: Park... Ji-Young. I feel terrible. Cold and shaking.
nurse: I can see you're shivering. Your temperature is thirty-eight point nine. When did this start?
patient: This morning. I felt fine yesterday after my operation.
nurse: Any pain at the operation site or anywhere new?
patient: The wound feels hot. And I have pain when I wee.
nurse: Thank you — that's important. I'm going to take blood cultures and check your lactate right now.
patient: Is something wrong with me?
nurse: Your body is showing signs that it may be fighting an infection. We're going to act quickly and treat it.
patient: I'm scared. Will I be okay?
nurse: We caught this early and the team is responding now. You're going to receive antibiotics very soon.`,
  },

  {
    lessonMatch: 'stroke',
    stepMatch: 'read the stroke',
    sceneSetting: 'Ward corridor',
    script: `nurse: Dr. Tran — Nurse Linh here. I've just assessed Mr. Ahmed in bed twelve and I'm very concerned.
doctor: What have you found?
nurse: He was fine at my last check thirty minutes ago. Now his speech is slurred and he cannot raise his left arm fully.
doctor: FAST assessment?
nurse: Face — left-sided droop noted. Arms — left arm drifts down significantly. Speech — slurred and confused. Time — symptom onset within the last thirty minutes.
doctor: I'm activating the stroke team now. Have CT arranged and get neurology on the phone.
nurse: CT is being arranged. Neurology bleep number is ready. Should I hold his antihypertensives?
doctor: Hold all medications until I've assessed him. What's his blood pressure?
nurse: One eighty-six over ninety-eight. GCS is thirteen — he's confused but rousable.
doctor: I'll be there in two minutes. Do not leave his side.`,
  },

  // ─── MODULE 8: Documentation & Handover ───────────────────────────────────

  {
    lessonMatch: 'end-of-shift handover',
    stepMatch: 'read the handover',
    sceneSetting: 'Nursing station',
    script: `nurse: Good evening — I'm handing over to you for the night shift. Shall we start with the high-dependency patients?
doctor: Go ahead — I'm ready.
nurse: Bed one — Mr. Nguyen, seventy years old, admitted with exacerbation of COPD. He's on two litres of oxygen, sats ninety-two percent, stable but requires two-hourly observations.
doctor: Any concerns overnight?
nurse: Yes — his respiratory rate has been creeping up throughout the afternoon. If it goes above twenty-five, escalate immediately.
doctor: Understood. Next?
nurse: Bed three — Mrs. Kim, post-laparoscopy day one. Comfortable on oral analgesia. She has a cannula in the right hand that needs replacing — it's tissued.
doctor: I'll sort that. Anyone nil-by-mouth?
nurse: Bed seven — Mr. Tran is fasted from midnight for a procedure tomorrow. He knows and his fluids are running.
doctor: Anything pending — labs, imaging, calls?
nurse: Waiting for Mr. Nguyen's blood gas results from four hours ago. Chased the lab — should be back within the hour.`,
  },

  // ─── MODULE 10: Emergency Procedures Communication ────────────────────────

  {
    lessonMatch: 'iv line',
    stepMatch: 'read the iv',
    sceneSetting: 'A&E bay',
    script: `nurse: I need to put a small needle into your vein so we can give you fluids and medication quickly. Is that okay?
patient: Will it hurt?
nurse: There'll be a small sharp scratch when the needle goes in — about two seconds. After that you shouldn't feel much.
patient: How long will the needle be in?
nurse: The needle comes out and leaves a tiny soft tube called a cannula. It stays in while you're here with us.
patient: What if I move my arm? Will it come out?
nurse: It's secured with a dressing so it won't fall out with normal movement. Try to avoid bending your elbow sharply.
patient: What are you going to give me through it?
nurse: First some saline to keep you hydrated, then the doctor will prescribe medications based on your assessment.
patient: Okay. I'm ready. Can you do it quickly?
nurse: Of course. I'll do my count — sharp scratch coming now. One, two — done. Well done.`,
  },

  {
    lessonMatch: 'ng tube',
    stepMatch: 'read the ng',
    sceneSetting: 'A&E bay',
    script: `nurse: The doctor has recommended we pass a thin tube through your nose and down to your stomach. This is called an NG tube.
patient: That sounds very uncomfortable. Do I have to have it?
nurse: It's the safest way to give you nutrition and medication right now because you can't swallow safely.
patient: Will it hurt?
nurse: It can feel uncomfortable — there may be a gagging sensation as it passes. It's over in about thirty seconds.
patient: And then what happens?
nurse: Once it's in place, you won't feel it at all. We check it's in the right position before using it.
patient: How do you check it?
nurse: We draw back a small amount of fluid and test it, then confirm with an X-ray if needed.
patient: Do I have to be awake for it?
nurse: Yes — your cooperation actually makes it easier and safer. You can squeeze my hand if you need to.
patient: Alright. I trust you. Let's do it.`,
  },

  // ─── MODULE 12: Family Communication in Emergencies ───────────────────────

  {
    lessonMatch: 'cardiac arrest',
    stepMatch: 'read the difficult news',
    sceneSetting: 'Relatives room',
    script: `nurse: Thank you for waiting. Please sit down. I'm Nurse Linh — I've been with your husband today.
family: Is he okay? What's happened?
nurse: I need to tell you that your husband had a very serious event — his heart stopped. The team worked very hard to help him.
family: His heart stopped? Is he... is he alive?
nurse: He is alive. The team was able to restart his heart, but he is in a critical condition and on a breathing machine.
family: Can I see him?
nurse: Yes, very soon. I want to prepare you a little first — there are many machines and tubes, but they are all there to help him.
family: Will he recover?
nurse: I honestly can't answer that right now. The next hours are very important. The doctor will come to explain more.
family: I can't... I can't believe this is happening.
nurse: I know. I'm so sorry you're going through this. You don't have to be alone — I'll stay with you until the doctor comes.`,
  },

  {
    lessonMatch: 'cpr',
    stepMatch: 'read the cpr',
    sceneSetting: 'Quiet room',
    script: `nurse: Thank you for agreeing to speak with me. This is a very difficult conversation, but an important one.
family: The doctor mentioned something about resuscitation. I don't fully understand.
nurse: That's okay — I'll explain as clearly as I can. CPR stands for cardiopulmonary resuscitation — it's what we do if someone's heart stops.
family: Like in the films? Pushing on the chest?
nurse: Exactly — although it's more intense than films show. It can sometimes help restart the heart, but it doesn't always work.
family: And for my father — should he have it?
nurse: That decision involves considering his age, his condition, and what he would want. That's what we're trying to understand together.
family: He never told us what he wanted. We never had this conversation.
nurse: That's very common — most people don't. That's why we're having it now, while there's time to think carefully.
family: What would you recommend?
nurse: I'm not able to make this decision for you, but I can tell you the team is here to support whatever you decide.`,
  },

  {
    lessonMatch: 'condition has worsened',
    stepMatch: 'read the deterioration',
    sceneSetting: 'Relatives room',
    script: `nurse: Thank you for coming in. Please take a seat. I need to share some difficult news with you about your mother.
family: What's happened? She was stable this morning.
nurse: Her condition has changed over the past few hours. Her kidneys are not responding as we hoped and her blood pressure has been harder to maintain.
family: Does this mean she's getting worse?
nurse: Yes. We want to be honest with you — she is deteriorating despite our treatment.
family: What does that mean for her? Will she get better?
nurse: We're doing everything we can, but I'd be giving you false hope if I said recovery is certain. The team is with her.
family: Should we call the rest of the family?
nurse: That would be a good idea. Now is a time to gather.
family: Can we be with her?
nurse: Yes. We'll bring you in right now. You can hold her hand and talk to her — that matters very much.`,
  },
]

/**
 * Find a script matching a given lesson + step title.
 * Uses case-insensitive partial matching on both fields.
 */
export function findScript(lessonTitle: string, stepTitle: string): ScriptEntry | undefined {
  const lNorm = lessonTitle.toLowerCase()
  const sNorm = stepTitle.toLowerCase()

  return ANIMATION_SCRIPTS.find(
    entry =>
      lNorm.includes(entry.lessonMatch.toLowerCase()) &&
      sNorm.includes(entry.stepMatch.toLowerCase())
  )
}
