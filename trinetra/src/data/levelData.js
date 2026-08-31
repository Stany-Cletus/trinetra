export const LEVEL_DATA = {
  1: {
    id: 1,
    title: "FREE WI-FI",
    threat: "PUBLIC WI-FI",

    dilemma: {
      situation:
        "You are at a railway station. You need internet, and you see a free Wi-Fi network.",

      tension:
        "Your friend says, 'Come on! It's free. Just connect.'",

      question: "What will you do?",

      choices: [
        {
          id: "connect",
          title: "Connect",
          text: "It's free, so you decide to try it.",

          consequence:
            "The network may be fake. Your device could be exposed.",

          worldState: {
            wifiRisk: true,
          },

          pathNotTaken:
            "If you had checked the network first, you could have avoided the risk.",
        },

        {
          id: "verify",
          title: "Verify first",
          text: "Check with the station or an official source.",

          consequence:
            "You find out which Wi-Fi network is actually official.",

          worldState: {
            wifiRisk: false,
          },

          pathNotTaken:
            "Connecting without checking could have exposed your device.",
        },

        {
          id: "mobile_data",
          title: "Use mobile data",
          text: "Avoid the unknown network.",

          consequence:
            "You stay safe by using your own connection.",

          worldState: {
            wifiRisk: false,
          },

          pathNotTaken:
            "The unknown network could have put your device at risk.",
        },
      ],
    },
  },

  2: {
    id: 2,
    title: "PRIVATE PHOTO",
    threat: "PRIVACY",

    dilemma: {
      situation:
        "A private photo of another student reaches your group.",

      tension:
        "Your friend asks you to forward it because everyone is talking about it.",

      question: "What will you do?",

      choices: [
        {
          id: "forward",
          title: "Forward it",
          text: "Everyone wants to see it.",

          consequence:
            "The photo spreads to more people without the person's permission.",

          worldState: {
            photoShared: true,
            reputationProtected: false,
          },

          pathNotTaken:
            "Refusing to share it could have stopped the spread.",
        },

        {
          id: "refuse",
          title: "Don't share",
          text: "The person did not give permission.",

          consequence:
            "You stop the photo from spreading through you.",

          worldState: {
            photoShared: false,
            reputationProtected: true,
          },

          pathNotTaken:
            "Forwarding it would have helped spread someone's private content.",
        },

        {
          id: "ask_permission",
          title: "Ask first",
          text: "Contact the person before sharing anything.",

          consequence:
            "You give the person control over their own photo.",

          worldState: {
            photoShared: false,
            reputationProtected: true,
          },

          pathNotTaken:
            "Sharing without asking would remove their control over the photo.",
        },
      ],
    },
  },

  3: {
    id: 3,
    title: "PAYMENT SECRET",
    threat: "PAYMENT SECURITY",

    dilemma: {
      situation:
        "Someone asks you for a payment credential because they say they need urgent help.",

      tension:
        "You trust them, but sharing a payment credential can be dangerous.",

      question: "What will you do?",

      choices: [
        {
          id: "share",
          title: "Share it",
          text: "You trust the person.",

          consequence:
            "The credential is exposed and the account could be put at risk.",

          worldState: {
            paymentCredentialShared: true,
          },

          pathNotTaken:
            "You could have helped without sharing a private credential.",
        },

        {
          id: "refuse",
          title: "Don't share",
          text: "Payment credentials should stay private.",

          consequence:
            "You protect the account while finding another way to help.",

          worldState: {
            paymentCredentialShared: false,
          },

          pathNotTaken:
            "Sharing the credential could have exposed the account.",
        },

        {
          id: "find_safe_way",
          title: "Find another way",
          text: "Verify the situation and help safely.",

          consequence:
            "You help without exposing the credential.",

          worldState: {
            paymentCredentialShared: false,
          },

          pathNotTaken:
            "Sharing immediately would have created an unnecessary risk.",
        },
      ],
    },
  },

  4: {
    id: 4,
    title: "TEACHER DEEPFAKE",
    threat: "DEEPFAKE",

    dilemma: {
      situation:
        "A video appears to show your teacher saying something embarrassing.",

      tension:
        "Your friends want you to forward it before everyone else sees it.",

      question: "What will you do?",

      choices: [
        {
          id: "forward",
          title: "Forward it",
          text: "It looks real and everyone is sharing it.",

          consequence:
            "The video spreads before anyone checks whether it is real.",

          worldState: {
            deepfakeForwarded: true,
            reputationProtected: false,
          },

          pathNotTaken:
            "Checking first could have prevented misinformation from spreading.",
        },

        {
          id: "verify",
          title: "Verify first",
          text: "Check the source before sharing.",

          consequence:
            "You find signs that the video may have been manipulated.",

          worldState: {
            deepfakeForwarded: false,
            reputationProtected: true,
          },

          pathNotTaken:
            "Sharing it immediately could have damaged someone's reputation.",
        },

        {
          id: "warn",
          title: "Warn your friends",
          text: "Tell them not to share it yet.",

          consequence:
            "The group pauses before spreading the video.",

          worldState: {
            deepfakeForwarded: false,
            reputationProtected: true,
          },

          pathNotTaken:
            "Continuing to share it could have spread false information.",
        },
      ],
    },
  },

  5: {
    id: 5,
    title: "DATA LEAK",
    threat: "PERSONAL DATA",

    dilemma: {
      situation:
        "You discover another student's personal information exposed online.",

      tension:
        "You are curious, but the information was not meant for you.",

      question: "What will you do?",

      choices: [
        {
          id: "explore",
          title: "Look through it",
          text: "You are curious.",

          consequence:
            "You access private information that was not meant for you.",

          worldState: {
            dataLeakReported: false,
          },

          pathNotTaken:
            "Reporting the leak immediately could have reduced the exposure.",
        },

        {
          id: "report",
          title: "Report it",
          text: "Tell a trusted adult or responsible platform.",

          consequence:
            "The issue can be addressed and the student's information protected.",

          worldState: {
            dataLeakReported: true,
          },

          pathNotTaken:
            "Ignoring the leak could have allowed the information to remain exposed.",
        },

        {
          id: "tell_friend",
          title: "Tell a friend",
          text: "Discuss it with someone first.",

          consequence:
            "Another person learns about the exposed information before it is reported.",

          worldState: {
            dataLeakReported: false,
          },

          pathNotTaken:
            "Reporting directly would have limited further exposure.",
        },
      ],
    },
  },
};