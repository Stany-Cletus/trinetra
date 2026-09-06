export const LEVEL_DATA = {
  1: {
    number: "01", title: "FREE WI-FI TRAP", concept: "Network safety",
    situation: "A free network appears at a café. Your friend says, 'Just connect — everyone is using it.'",
    prompt: "What would you do before connecting?",
    choices: [
      { id: "verify", title: "Verify the network first", reason: "I would confirm the network name with the venue and avoid sensitive activity on an untrusted network.", outcome: "You reduce the chance of joining a fake access point.", next: "That caution becomes important when a network asks for unexpected information." },
      { id: "connect", title: "Connect because it is free", reason: "It looks convenient and other people are using it.", outcome: "A free network can still be controlled by someone else.", next: "Convenience can hide risk when you cannot verify who operates the network." },
      { id: "ask", title: "Ask a trusted person", reason: "I am unsure, so I would check before connecting.", outcome: "Getting a second opinion can prevent an impulsive decision.", next: "Good security decisions often start with slowing down and asking." },
    ],
  },
  2: {
    number: "02", title: "SHARED PHOTO", concept: "Consent and privacy",
    situation: "A friend sends you a funny group photo from school. Another person in it asks you not to post it publicly.",
    prompt: "What is the most respectful response?",
    choices: [
      { id: "post", title: "Post it anyway", reason: "The photo is funny and I did not take it seriously.", outcome: "Sharing can expose someone without their consent.", next: "A harmless-looking post can become a privacy problem once it spreads." },
      { id: "ask", title: "Ask everyone shown before posting", reason: "People in the photo should have a say in how it is shared.", outcome: "You respect consent and reduce unwanted exposure.", next: "Privacy is not only about secrets; it is also about control over your own image." },
      { id: "private", title: "Keep it in the private chat", reason: "I can enjoy the photo without making it public.", outcome: "You choose a lower-risk way to share.", next: "Choosing a smaller audience is often a useful privacy safeguard." },
    ],
  },
  3: {
    number: "03", title: "PAYMENT CREDENTIAL", concept: "Phishing and payment safety",
    situation: "A familiar-looking chat says you must enter a UPI PIN on a linked page to receive an urgent refund.",
    prompt: "What should you do?",
    choices: [
      { id: "pin", title: "Enter the PIN quickly", reason: "The message sounds urgent and the page looks official.", outcome: "A PIN should never be entered into an unknown webpage.", next: "Urgency and official-looking screens are common social-engineering techniques." },
      { id: "verify", title: "Open the official app and verify", reason: "I would avoid the link and check the transaction through a trusted channel.", outcome: "You separate the claim from the suspicious link.", next: "Independent verification is stronger than trusting a message's appearance." },
      { id: "adult", title: "Ask a trusted adult", reason: "The payment request is unusual and I want another person to check it.", outcome: "You pause before exposing sensitive information.", next: "Asking for help is a security skill, not a weakness." },
    ],
  },
  4: {
    number: "04", title: "TEACHER DEEPFAKE", concept: "Media verification",
    situation: "You receive a video that appears to show a teacher asking students to send money to a new account.",
    prompt: "How should you respond?",
    choices: [
      { id: "forward", title: "Forward it to classmates", reason: "Everyone needs to know about the request.", outcome: "Forwarding an unverified deepfake can amplify the deception.", next: "Even a convincing video can be manipulated or taken out of context." },
      { id: "verify", title: "Verify through the school", reason: "I would contact the teacher or school using a known channel.", outcome: "Independent verification can expose a fake message before money is sent.", next: "Trust should come from the source, not only from what a video appears to show." },
      { id: "wait", title: "Wait and ask a friend", reason: "I would not act until someone else confirms it.", outcome: "Delaying an irreversible action gives you time to verify.", next: "A pause can be a powerful safety mechanism." },
    ],
  },
  5: {
    number: "05", title: "DATA LEAK", concept: "Data minimisation",
    situation: "A new app asks for your name, school, phone number, location, ID number and password to create an account.",
    prompt: "Which principle should guide your decision?",
    choices: [
      { id: "all", title: "Give everything requested", reason: "The app says the information is needed.", outcome: "More collected data means more information that can be exposed or misused.", next: "A request is not automatically justified just because a form asks for it." },
      { id: "minimum", title: "Share only what is necessary", reason: "I would check what the service actually needs for its purpose.", outcome: "Data minimisation reduces unnecessary exposure.", next: "Good privacy decisions ask whether each piece of data has a real purpose." },
      { id: "ask", title: "Ask why each item is needed", reason: "I want to understand the purpose before sharing personal information.", outcome: "Questioning collection can reveal unnecessary or risky requests.", next: "Privacy is also about understanding and challenging data practices." },
    ],
  },
};
