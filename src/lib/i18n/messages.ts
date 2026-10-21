import type { Locale } from "./types";
import { siteMessages } from "./site-messages";

export type Messages = {
  common: {
    brand: string;
    loading: string;
    select: string;
    back: string;
    next: string;
    save: string;
    continue: string;
    somethingWrong: string;
  };
  nav: {
    home: string;
    plan: string;
    contact: string;
    login: string;
    register: string;
    dashboard: string;
    profile: string;
    interests: string;
    chats: string;
    settings: string;
    logout: string;
    language: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    otpTitle: string;
    otpSubtitle: string;
    mobile: string;
    email: string;
    mobileNumber: string;
    emailAddress: string;
    registeredSuffix: string;
    lockedHint: string;
    useDifferent: string;
    sendOtp: string;
    sendingOtp: string;
    alreadyAccount: string;
    newHere: string;
    createAccount: string;
    enterCodeFor: string;
    sameLoginHintMobile: string;
    sameLoginHintEmail: string;
    otpDeliveredSms: string;
    otpDeliveredEmail: string;
    otpCode: string;
    verifying: string;
    verifyContinue: string;
    resendIn: string;
    resending: string;
    resendOtp: string;
    failedSend: string;
    failedVerify: string;
    loginOpensProfile: string;
    signupStartsForms: string;
  };
  mic: {
    speak: string;
    listening: string;
    stop: string;
    unsupported: string;
    permissionDenied: string;
    hint: string;
  };
  onboarding: {
    title: string;
    subtitle: string;
    stepOf: string;
    steps: {
      lookingFor: string;
      identity: string;
      community: string;
      career: string;
      family: string;
      finish: string;
    };
    bride: string;
    groom: string;
    brideSub: string;
    groomSub: string;
    fullName: string;
    fullNamePh: string;
    dob: string;
    birthTime: string;
    birthPlace: string;
    birthPlacePh: string;
    height: string;
    complexion: string;
    motherTongue: string;
    religion: string;
    caste: string;
    subCaste: string;
    selectReligion: string;
    selectCaste: string;
    selectSubCaste: string;
    education: string;
    occupation: string;
    incomeRange: string;
    city: string;
    cityPh: string;
    state: string;
    address: string;
    addressPh: string;
    fatherName: string;
    fatherOccupation: string;
    motherName: string;
    motherOccupation: string;
    brothersCount: string;
    brothersNames: string;
    sistersCount: string;
    sistersNames: string;
    maritalStatus: string;
    spouseName: string;
    spouseOccupation: string;
    finishHint: string;
    saveContinue: string;
    saving: string;
    errors: {
      selectGender: string;
      fullName: string;
      dob: string;
      motherTongue: string;
      height: string;
      birthPlace: string;
      birthTime: string;
      complexion: string;
      age: string;
      community: string;
      career: string;
      father: string;
      mother: string;
      brothersCount: string;
      brothersNames: string;
      sistersCount: string;
      sistersNames: string;
      marital: string;
      spouse: string;
      saveFailed: string;
      saveProfileError: string;
    };
  };
  contact: {
    fullName: string;
    email: string;
    phone: string;
    message: string;
    send: string;
    thanks: string;
  };
  preferences: {
    title: string;
    subtitle: string;
    editTitle: string;
    editSubtitle: string;
  };
  editProfile: {
    title: string;
    subtitle: string;
  };
};

export const messages: Record<Locale, Messages> = {
  en: {
    common: {
      brand: "BandhanMil",
      loading: "Loading…",
      select: "Select",
      back: "Back",
      next: "Next",
      save: "Save",
      continue: "Continue",
      somethingWrong: "Something went wrong. Please try again.",
    },
    nav: {
      home: "Home",
      plan: "Plan",
      contact: "Contact",
      login: "Login",
      register: "Sign up",
      dashboard: "Dashboard",
      profile: "Profile",
      interests: "Interests",
      chats: "Chat list",
      settings: "Settings",
      logout: "Logout",
      language: "Language",
    },
    auth: {
      loginTitle: "Welcome back",
      loginSubtitle:
        "Enter your registered mobile or email. After OTP, your profile opens.",
      registerTitle: "Create your account",
      registerSubtitle:
        "New here? Verify mobile or email, then complete the profile forms.",
      otpTitle: "Verify OTP",
      otpSubtitle: "Enter the one-time code to continue.",
      mobile: "Mobile",
      email: "Email",
      mobileNumber: "Mobile number",
      emailAddress: "Email address",
      registeredSuffix: " (registered)",
      lockedHint:
        "Login uses the same number/email you registered with.",
      useDifferent: "Use different number",
      sendOtp: "Send OTP & continue",
      sendingOtp: "Sending OTP…",
      alreadyAccount: "Already registered?",
      newHere: "New here?",
      createAccount: "Sign up",
      enterCodeFor: "Enter the 6-digit code for",
      sameLoginHintMobile:
        "This mobile number is your login credential every time.",
      sameLoginHintEmail:
        "This email is your login credential every time.",
      otpDeliveredSms: "OTP SMS has been sent. Check your messages.",
      otpDeliveredEmail: "OTP email has been sent. Check your inbox.",
      otpCode: "OTP code",
      verifying: "Verifying…",
      verifyContinue: "Verify & open profile",
      resendIn: "Resend in {seconds}s",
      resending: "Resending…",
      resendOtp: "Resend OTP",
      failedSend: "Failed to send OTP",
      failedVerify: "Verification failed",
      loginOpensProfile:
        "Registered members: login → OTP → your profile dashboard.",
      signupStartsForms:
        "New members: sign up → OTP → fill profile forms step by step.",
    },
    mic: {
      speak: "Speak to fill",
      listening: "Listening… tap to stop",
      stop: "Stop",
      unsupported: "Voice input is not supported in this browser. Try Chrome.",
      permissionDenied: "Microphone permission denied.",
      hint: "Tap the mic and speak — the text will fill this field.",
    },
    onboarding: {
      title: "Complete your profile",
      subtitle: "Tell us about yourself so we can find the right matches.",
      stepOf: "Step {current} of {total}: {name}",
      steps: {
        lookingFor: "Looking for",
        identity: "Identity",
        community: "Community",
        career: "Career",
        family: "Family",
        finish: "Finish",
      },
      bride: "Bride",
      groom: "Groom",
      brideSub: "Creating a bride profile",
      groomSub: "Creating a groom profile",
      fullName: "Full name",
      fullNamePh: "As on official documents",
      dob: "Date of birth",
      birthTime: "Birth time",
      birthPlace: "Birth place",
      birthPlacePh: "City / town of birth",
      height: "Height",
      complexion: "Color / complexion",
      motherTongue: "Mother tongue",
      religion: "Religion",
      caste: "Caste",
      subCaste: "Sub-caste",
      selectReligion: "Select religion",
      selectCaste: "Select caste",
      selectSubCaste: "Select sub-caste",
      education: "Education",
      occupation: "Occupation",
      incomeRange: "Income range",
      city: "City",
      cityPh: "e.g. Pune",
      state: "State",
      address: "Full address",
      addressPh: "House / street / area / landmark",
      fatherName: "Father full name",
      fatherOccupation: "Father occupation",
      motherName: "Mother name",
      motherOccupation: "Mother occupation",
      brothersCount: "How many brothers?",
      brothersNames: "Brother name(s)",
      sistersCount: "How many sisters?",
      sistersNames: "Sister name(s)",
      maritalStatus: "Marital status",
      spouseName: "Spouse name",
      spouseOccupation: "Spouse occupation",
      finishHint: "Add a photo (optional) and save to continue to partner preferences.",
      saveContinue: "Save & continue",
      saving: "Saving…",
      errors: {
        selectGender: "Select bride or groom.",
        fullName: "Enter your full name.",
        dob: "Select date of birth.",
        motherTongue: "Select mother tongue.",
        height: "Select height.",
        birthPlace: "Enter birth place.",
        birthTime: "Enter birth time.",
        complexion: "Select complexion / color.",
        age: "You must be at least 18 years old.",
        community: "Select religion, caste, and sub-caste.",
        career: "Complete career, city, state, and full address.",
        father: "Enter father name and occupation.",
        mother: "Enter mother name and occupation.",
        brothersCount: "Enter how many brothers you have.",
        brothersNames: "Enter brother name(s).",
        sistersCount: "Enter how many sisters you have.",
        sistersNames: "Enter sister name(s).",
        marital: "Select marital status.",
        spouse: "Enter spouse name and occupation.",
        saveFailed: "Could not save profile",
        saveProfileError: "Something went wrong while saving your profile.",
      },
    },
    contact: {
      fullName: "Full name",
      email: "Email",
      phone: "Phone",
      message: "Message",
      send: "Send message",
      thanks: "Thank you. Our support team will contact you shortly.",
    },
    preferences: {
      title: "Partner preferences",
      subtitle: "Tell us what you are looking for in a life partner.",
      editTitle: "Edit preferences",
      editSubtitle: "Update what you prefer in a match.",
    },
    editProfile: {
      title: "Edit profile",
      subtitle: "Keep your details up to date for better matches.",
    },
  },
  hi: {
    common: {
      brand: "बंधनमिल",
      loading: "लोड हो रहा है…",
      select: "चुनें",
      back: "वापस",
      next: "आगे",
      save: "सेव करें",
      continue: "जारी रखें",
      somethingWrong: "कुछ गलत हो गया। कृपया फिर कोशिश करें।",
    },
    nav: {
      home: "होम",
      plan: "प्लान",
      contact: "संपर्क",
      login: "लॉगिन",
      register: "साइन अप",
      dashboard: "डैशबोर्ड",
      profile: "प्रोफ़ाइल",
      interests: "रुचियाँ",
      chats: "चैट सूची",
      settings: "सेटिंग्स",
      logout: "लॉगआउट",
      language: "भाषा",
    },
    auth: {
      loginTitle: "वापस स्वागत है",
      loginSubtitle:
        "अपना रजिस्टर्ड मोबाइल या ईमेल डालें। OTP के बाद आपकी प्रोफ़ाइल खुल जाएगी।",
      registerTitle: "नया अकाउंट बनाएँ",
      registerSubtitle:
        "नए हैं? मोबाइल या ईमेल वेरिफाई करें, फिर प्रोफ़ाइल फ़ॉर्म भरें।",
      otpTitle: "OTP वेरिफाई करें",
      otpSubtitle: "आगे बढ़ने के लिए वन-टाइम कोड डालें।",
      mobile: "मोबाइल",
      email: "ईमेल",
      mobileNumber: "मोबाइल नंबर",
      emailAddress: "ईमेल पता",
      registeredSuffix: " (रजिस्टर्ड)",
      lockedHint: "लॉगिन उसी नंबर/ईमेल से होता है जिससे आपने रजिस्टर किया था।",
      useDifferent: "दूसरा नंबर इस्तेमाल करें",
      sendOtp: "OTP भेजें और आगे बढ़ें",
      sendingOtp: "OTP भेजा जा रहा है…",
      alreadyAccount: "पहले से रजिस्टर्ड हैं?",
      newHere: "नए हैं?",
      createAccount: "साइन अप",
      enterCodeFor: "इसके लिए 6 अंकों का कोड डालें",
      sameLoginHintMobile: "हर बार लॉगिन के लिए यही मोबाइल नंबर आपका क्रेडेंशियल है।",
      sameLoginHintEmail: "हर बार लॉगिन के लिए यही ईमेल आपका क्रेडेंशियल है।",
      otpDeliveredSms: "OTP SMS भेज दिया गया है। मैसेज चेक करें।",
      otpDeliveredEmail: "OTP ईमेल भेज दिया गया है। इनबॉक्स चेक करें।",
      otpCode: "OTP कोड",
      verifying: "वेरिफाई हो रहा है…",
      verifyContinue: "वेरिफाई करें और प्रोफ़ाइल खोलें",
      resendIn: "{seconds} सेकंड में फिर भेजें",
      resending: "फिर भेजा जा रहा है…",
      resendOtp: "OTP फिर भेजें",
      failedSend: "OTP नहीं भेजा जा सका",
      failedVerify: "वेरिफिकेशन असफल",
      loginOpensProfile:
        "रजिस्टर्ड सदस्य: लॉगिन → OTP → आपकी प्रोफ़ाइल डैशबोर्ड।",
      signupStartsForms:
        "नए सदस्य: साइन अप → OTP → प्रोफ़ाइल फ़ॉर्म चरणबद्ध भरें।",
    },
    mic: {
      speak: "बोलकर भरें",
      listening: "सुन रहा है… रोकने के लिए टैप करें",
      stop: "रोकें",
      unsupported: "इस ब्राउज़र में वॉइस इनपुट नहीं चलता। Chrome आज़माएँ।",
      permissionDenied: "माइक्रोफ़ोन की अनुमति नहीं मिली।",
      hint: "माइक पर टैप करके बोलें — टेक्स्ट इस फ़ील्ड में भर जाएगा।",
    },
    onboarding: {
      title: "अपनी प्रोफ़ाइल पूरी करें",
      subtitle: "सही रिश्ते के लिए अपने बारे में बताएँ।",
      stepOf: "चरण {current} / {total}: {name}",
      steps: {
        lookingFor: "किसके लिए",
        identity: "पहचान",
        community: "समुदाय",
        career: "करियर",
        family: "परिवार",
        finish: "समाप्त",
      },
      bride: "दुल्हन",
      groom: "दूल्हा",
      brideSub: "दुल्हन की प्रोफ़ाइल बना रहे हैं",
      groomSub: "दूल्हे की प्रोफ़ाइल बना रहे हैं",
      fullName: "पूरा नाम",
      fullNamePh: "आधिकारिक दस्तावेज़ के अनुसार",
      dob: "जन्म तिथि",
      birthTime: "जन्म समय",
      birthPlace: "जन्म स्थान",
      birthPlacePh: "जन्म का शहर / कस्बा",
      height: "ऊंचाई",
      complexion: "रंग / कॉम्प्लेक्शन",
      motherTongue: "मातृभाषा",
      religion: "धर्म",
      caste: "जाति",
      subCaste: "उपजाति",
      selectReligion: "धर्म चुनें",
      selectCaste: "जाति चुनें",
      selectSubCaste: "उपजाति चुनें",
      education: "शिक्षा",
      occupation: "व्यवसाय",
      incomeRange: "आय सीमा",
      city: "शहर",
      cityPh: "जैसे पुणे",
      state: "राज्य",
      address: "पूरा पता",
      addressPh: "मकान / गली / इलाका / लैंडमार्क",
      fatherName: "पिता का पूरा नाम",
      fatherOccupation: "पिता का व्यवसाय",
      motherName: "माता का नाम",
      motherOccupation: "माता का व्यवसाय",
      brothersCount: "कितने भाई?",
      brothersNames: "भाई के नाम",
      sistersCount: "कितनी बहनें?",
      sistersNames: "बहन के नाम",
      maritalStatus: "वैवाहिक स्थिति",
      spouseName: "जीवनसाथी का नाम",
      spouseOccupation: "जीवनसाथी का व्यवसाय",
      finishHint:
        "फ़ोटो जोड़ें (वैकल्पिक) और पार्टनर प्राथमिकताओं के लिए सेव करें।",
      saveContinue: "सेव करें और आगे बढ़ें",
      saving: "सेव हो रहा है…",
      errors: {
        selectGender: "दुल्हन या दूल्हा चुनें।",
        fullName: "अपना पूरा नाम लिखें।",
        dob: "जन्म तिथि चुनें।",
        motherTongue: "मातृभाषा चुनें।",
        height: "ऊंचाई चुनें।",
        birthPlace: "जन्म स्थान लिखें।",
        birthTime: "जन्म समय लिखें।",
        complexion: "रंग / कॉम्प्लेक्शन चुनें।",
        age: "आपकी आयु कम से कम 18 वर्ष होनी चाहिए।",
        community: "धर्म, जाति और उपजाति चुनें।",
        career: "करियर, शहर, राज्य और पूरा पता भरें।",
        father: "पिता का नाम और व्यवसाय लिखें।",
        mother: "माता का नाम और व्यवसाय लिखें।",
        brothersCount: "भाइयों की संख्या लिखें।",
        brothersNames: "भाई के नाम लिखें।",
        sistersCount: "बहनों की संख्या लिखें।",
        sistersNames: "बहन के नाम लिखें।",
        marital: "वैवाहिक स्थिति चुनें।",
        spouse: "जीवनसाथी का नाम और व्यवसाय लिखें।",
        saveFailed: "प्रोफ़ाइल सेव नहीं हो सकी",
        saveProfileError: "प्रोफ़ाइल सेव करते समय समस्या आई।",
      },
    },
    contact: {
      fullName: "पूरा नाम",
      email: "ईमेल",
      phone: "फ़ोन",
      message: "संदेश",
      send: "संदेश भेजें",
      thanks: "धन्यवाद। हमारी टीम जल्द संपर्क करेगी।",
    },
    preferences: {
      title: "पार्टनर प्राथमिकताएँ",
      subtitle: "बताएँ कि जीवनसाथी में आप क्या चाहते हैं।",
      editTitle: "प्राथमिकताएँ बदलें",
      editSubtitle: "मैच के लिए अपनी पसंद अपडेट करें।",
    },
    editProfile: {
      title: "प्रोफ़ाइल संपादित करें",
      subtitle: "बेहतर मैच के लिए विवरण अपडेट रखें।",
    },
  },
  mr: {
    common: {
      brand: "बंधनमिल",
      loading: "लोड होत आहे…",
      select: "निवडा",
      back: "मागे",
      next: "पुढे",
      save: "सेव्ह करा",
      continue: "सुरू ठेवा",
      somethingWrong: "काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.",
    },
    nav: {
      home: "होम",
      plan: "प्लान",
      contact: "संपर्क",
      login: "लॉगिन",
      register: "साइन अप",
      dashboard: "डॅशबोर्ड",
      profile: "प्रोफाइल",
      interests: "आवडी",
      chats: "चॅट यादी",
      settings: "सेटिंग्ज",
      logout: "लॉगआउट",
      language: "भाषा",
    },
    auth: {
      loginTitle: "पुन्हा स्वागत आहे",
      loginSubtitle:
        "तुमचा नोंदणीकृत मोबाइल किंवा ईमेल टाका. OTP नंतर तुमची प्रोफाइल उघडेल.",
      registerTitle: "नवीन खाते तयार करा",
      registerSubtitle:
        "नवीन आहात? मोबाइल किंवा ईमेल पडताळा, नंतर प्रोफाइल फॉर्म भरा.",
      otpTitle: "OTP पडताळा",
      otpSubtitle: "पुढे जाण्यासाठी वन-टाइम कोड टाका.",
      mobile: "मोबाइल",
      email: "ईमेल",
      mobileNumber: "मोबाइल नंबर",
      emailAddress: "ईमेल पत्ता",
      registeredSuffix: " (नोंदणीकृत)",
      lockedHint: "लॉगिन त्याच नंबर/ईमेलने होते ज्याने नोंदणी केली होती.",
      useDifferent: "दुसरा नंबर वापरा",
      sendOtp: "OTP पाठवा आणि पुढे जा",
      sendingOtp: "OTP पाठवत आहे…",
      alreadyAccount: "आधीच नोंदणी केली आहे?",
      newHere: "नवीन आहात?",
      createAccount: "साइन अप",
      enterCodeFor: "यासाठी ६ अंकी कोड टाका",
      sameLoginHintMobile: "दरवेळी लॉगिनसाठी हा मोबाइल नंबर तुमचे क्रेडेन्शियल आहे.",
      sameLoginHintEmail: "दरवेळी लॉगिनसाठी हा ईमेल तुमचे क्रेडेन्शियल आहे.",
      otpDeliveredSms: "OTP SMS पाठवला आहे. मेसेज तपासा.",
      otpDeliveredEmail: "OTP ईमेल पाठवला आहे. इनबॉक्स तपासा.",
      otpCode: "OTP कोड",
      verifying: "पडताळत आहे…",
      verifyContinue: "पडताळा आणि प्रोफाइल उघडा",
      resendIn: "{seconds} सेकंदात पुन्हा पाठवा",
      resending: "पुन्हा पाठवत आहे…",
      resendOtp: "OTP पुन्हा पाठवा",
      failedSend: "OTP पाठवता आला नाही",
      failedVerify: "पडताळणी अयशस्वी",
      loginOpensProfile:
        "नोंदणीकृत सदस्य: लॉगिन → OTP → तुमचे प्रोफाइल डॅशबोर्ड.",
      signupStartsForms:
        "नवीन सदस्य: साइन अप → OTP → प्रोफाइल फॉर्म टप्प्याटप्प्याने भरा.",
    },
    mic: {
      speak: "बोलून भरा",
      listening: "ऐकत आहे… थांबवण्यासाठी टॅप करा",
      stop: "थांबवा",
      unsupported: "या ब्राउझरमध्ये व्हॉइस इनपुट चालत नाही. Chrome वापरा.",
      permissionDenied: "मायक्रोफोन परवानगी नाकारली.",
      hint: "माइकवर टॅप करून बोला — मजकूर या फील्डमध्ये भरेल.",
    },
    onboarding: {
      title: "तुमची प्रोफाइल पूर्ण करा",
      subtitle: "योग्य जोडीदारासाठी स्वतःबद्दल सांगा.",
      stepOf: "टप्पा {current} / {total}: {name}",
      steps: {
        lookingFor: "कोणासाठी",
        identity: "ओळख",
        community: "समुदाय",
        career: "करिअर",
        family: "कुटुंब",
        finish: "समाप्त",
      },
      bride: "वधू",
      groom: "वर",
      brideSub: "वधूची प्रोफाइल तयार करत आहात",
      groomSub: "वराची प्रोफाइल तयार करत आहात",
      fullName: "पूर्ण नाव",
      fullNamePh: "अधिकृत कागदपत्रांनुसार",
      dob: "जन्मतारीख",
      birthTime: "जन्मवेळ",
      birthPlace: "जन्मस्थान",
      birthPlacePh: "जन्माचे शहर / गाव",
      height: "उंची",
      complexion: "रंग / कॉम्प्लेक्शन",
      motherTongue: "मातृभाषा",
      religion: "धर्म",
      caste: "जात",
      subCaste: "उपजात",
      selectReligion: "धर्म निवडा",
      selectCaste: "जात निवडा",
      selectSubCaste: "उपजात निवडा",
      education: "शिक्षण",
      occupation: "व्यवसाय",
      incomeRange: "उत्पन्न श्रेणी",
      city: "शहर",
      cityPh: "उदा. पुणे",
      state: "राज्य",
      address: "पूर्ण पत्ता",
      addressPh: "घर / रस्ता / परिसर / लँडमार्क",
      fatherName: "वडिलांचे पूर्ण नाव",
      fatherOccupation: "वडिलांचा व्यवसाय",
      motherName: "आईचे नाव",
      motherOccupation: "आईचा व्यवसाय",
      brothersCount: "किती भाऊ?",
      brothersNames: "भावांची नावे",
      sistersCount: "किती बहिणी?",
      sistersNames: "बहिणींची नावे",
      maritalStatus: "वैवाहिक स्थिती",
      spouseName: "जोडीदाराचे नाव",
      spouseOccupation: "जोडीदाराचा व्यवसाय",
      finishHint:
        "फोटो जोडा (ऐच्छिक) आणि जोडीदार प्राधान्यांसाठी सेव्ह करा.",
      saveContinue: "सेव्ह करा आणि पुढे जा",
      saving: "सेव्ह होत आहे…",
      errors: {
        selectGender: "वधू किंवा वर निवडा.",
        fullName: "तुमचे पूर्ण नाव लिहा.",
        dob: "जन्मतारीख निवडा.",
        motherTongue: "मातृभाषा निवडा.",
        height: "उंची निवडा.",
        birthPlace: "जन्मस्थान लिहा.",
        birthTime: "जन्मवेळ लिहा.",
        complexion: "रंग / कॉम्प्लेक्शन निवडा.",
        age: "तुमचे वय किमान १८ वर्षे असावे.",
        community: "धर्म, जात आणि उपजात निवडा.",
        career: "करिअर, शहर, राज्य आणि पूर्ण पत्ता भरा.",
        father: "वडिलांचे नाव आणि व्यवसाय लिहा.",
        mother: "आईचे नाव आणि व्यवसाय लिहा.",
        brothersCount: "भावांची संख्या लिहा.",
        brothersNames: "भावांची नावे लिहा.",
        sistersCount: "बहिणींची संख्या लिहा.",
        sistersNames: "बहिणींची नावे लिहा.",
        marital: "वैवाहिक स्थिती निवडा.",
        spouse: "जोडीदाराचे नाव आणि व्यवसाय लिहा.",
        saveFailed: "प्रोफाइल सेव्ह करता आली नाही",
        saveProfileError: "प्रोफाइल सेव्ह करताना अडचण आली.",
      },
    },
    contact: {
      fullName: "पूर्ण नाव",
      email: "ईमेल",
      phone: "फोन",
      message: "संदेश",
      send: "संदेश पाठवा",
      thanks: "धन्यवाद. आमची टीम लवकर संपर्क करेल.",
    },
    preferences: {
      title: "जोडीदार प्राधान्ये",
      subtitle: "जीवनसाथीमध्ये तुम्हाला काय हवे ते सांगा.",
      editTitle: "प्राधान्ये बदला",
      editSubtitle: "मॅचसाठी तुमची आवड अपडेट करा.",
    },
    editProfile: {
      title: "प्रोफाइल संपादित करा",
      subtitle: "चांगल्या मॅचसाठी तपशील अपडेट ठेवा.",
    },
  },
};

function lookup(
  catalog: unknown,
  parts: string[],
): string | undefined {
  let current: unknown = catalog;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const parts = key.split(".");
  const current =
    lookup(messages[locale], parts) ??
    lookup(siteMessages[locale], parts) ??
    lookup(messages.en, parts) ??
    lookup(siteMessages.en, parts);

  if (!current) return key;
  if (!params) return current;
  return current.replace(/\{(\w+)\}/g, (_, name: string) =>
    String(params[name] ?? `{${name}}`),
  );
}
