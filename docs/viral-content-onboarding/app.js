// Application data
const appData = {
  "content_topics": {
    "lifestyle_wellness": {
      "name": "Lifestyle & Wellness",
      "description": "Content focused on personal improvement, health, and daily routines",
      "icon": "🌿",
      "subtopics": [
        "Morning/Evening Routines",
        "Mental Health & Self-Care",
        "Fitness & Home Workouts", 
        "Healthy Recipes & Nutrition",
        "Productivity & Time Management",
        "Mindfulness & Meditation",
        "Sleep Optimization",
        "Habit Building"
      ],
      "trending_hashtags": ["#selfcare", "#morningroutine", "#healthylifestyle", "#mindfulness", "#wellness", "#productivity", "#mentalhealth", "#habitbuilding"]
    },
    "beauty_fashion": {
      "name": "Beauty & Fashion",
      "description": "Beauty tutorials, fashion trends, and style inspiration",
      "icon": "💄",
      "subtopics": [
        "Makeup Tutorials & GRWM",
        "Skincare Routines & Reviews", 
        "Fashion Hauls & Try-Ons",
        "Hair Care & Styling",
        "Nail Art & Manicures",
        "Outfit Ideas & Styling Tips",
        "Product Reviews & Unboxing",
        "Beauty Transformations"
      ],
      "trending_hashtags": ["#makeup", "#skincare", "#fashion", "#ootd", "#grwm", "#beauty", "#haircare", "#nailart"]
    },
    "entertainment_comedy": {
      "name": "Entertainment & Comedy",
      "description": "Humorous content, skits, and entertaining performances",
      "icon": "🎭",
      "subtopics": [
        "Comedy Skits & Parodies",
        "Reaction Videos",
        "Pranks & Challenges",
        "POV & Storytelling",
        "Voice Acting & Characters",
        "Memes & Viral Trends",
        "Behind-the-Scenes Content",
        "Relatable Humor"
      ],
      "trending_hashtags": ["#comedy", "#funny", "#pov", "#skit", "#relatable", "#viral", "#meme", "#entertainment"]
    },
    "food_cooking": {
      "name": "Food & Cooking",
      "description": "Recipe creation, cooking tutorials, and food content",
      "icon": "🍳",
      "subtopics": [
        "Quick & Easy Recipes",
        "Baking & Desserts",
        "Healthy Meal Prep",
        "International Cuisine",
        "Food Reviews & Tastings",
        "Cooking Techniques & Tips",
        "Dietary Restrictions (Vegan, Keto, etc.)",
        "Food Styling & Photography"
      ],
      "trending_hashtags": ["#food", "#recipe", "#cooking", "#baking", "#foodie", "#mealprep", "#healthyeating", "#yummy"]
    },
    "education_diy": {
      "name": "Educational & DIY",
      "description": "Teaching, tutorials, and how-to content",
      "icon": "📚",
      "subtopics": [
        "Study Tips & Methods",
        "Language Learning",
        "DIY Crafts & Projects",
        "Tech Tips & Tutorials",
        "Life Skills & Adulting",
        "Historical Facts & Stories",
        "Science Experiments",
        "Art & Creative Techniques"
      ],
      "trending_hashtags": ["#diy", "#tutorial", "#education", "#learning", "#studytips", "#lifehacks", "#howto", "#crafts"]
    },
    "business_finance": {
      "name": "Business & Finance",
      "description": "Entrepreneurship, money management, and career advice",
      "icon": "💼",
      "subtopics": [
        "Personal Finance Tips",
        "Investing & Stocks",
        "Entrepreneurship & Startups",
        "Career Development",
        "Side Hustles & Passive Income",
        "Budgeting & Saving",
        "Digital Marketing",
        "Freelancing & Remote Work"
      ],
      "trending_hashtags": ["#business", "#finance", "#investing", "#entrepreneur", "#money", "#career", "#sidehustle", "#personalfinance"]
    },
    "travel_adventure": {
      "name": "Travel & Adventure",
      "description": "Travel experiences, destinations, and adventure content",
      "icon": "✈️",
      "subtopics": [
        "Destination Highlights",
        "Travel Tips & Hacks",
        "Budget Travel",
        "Food & Culture Exploration",
        "Adventure Sports",
        "Solo Travel Experiences",
        "Travel Photography",
        "Road Trips & Local Exploration"
      ],
      "trending_hashtags": ["#travel", "#wanderlust", "#adventure", "#explore", "#vacation", "#roadtrip", "#solotravel", "#backpacking"]
    },
    "technology_gaming": {
      "name": "Technology & Gaming",
      "description": "Tech reviews, gaming content, and digital innovation",
      "icon": "🎮",
      "subtopics": [
        "Product Reviews & Unboxing",
        "Gaming Highlights & Tips",
        "Tech News & Trends",
        "App Reviews & Recommendations",
        "Gadget Comparisons",
        "Gaming Setup Tours",
        "Software Tutorials",
        "AI & Future Tech"
      ],
      "trending_hashtags": ["#tech", "#gaming", "#gadgets", "#technology", "#ai", "#software", "#techreview", "#innovation"]
    },
    "pets_animals": {
      "name": "Pets & Animals",
      "description": "Pet care, animal content, and wildlife education",
      "icon": "🐾",
      "subtopics": [
        "Pet Training & Care Tips",
        "Cute Pet Moments",
        "Animal Facts & Education",
        "Pet Product Reviews",
        "Wildlife & Nature",
        "Veterinary Advice",
        "Pet Adoption Stories",
        "Animal Rescue Content"
      ],
      "trending_hashtags": ["#pets", "#animals", "#dogs", "#cats", "#petcare", "#wildlife", "#animalrescue", "#pettraining"]
    },
    "fitness_sports": {
      "name": "Fitness & Sports",
      "description": "Workout routines, sports content, and athletic performance",
      "icon": "💪",
      "subtopics": [
        "Home Workout Routines",
        "Sports Highlights & Analysis",
        "Nutrition for Athletes", 
        "Gym Tips & Form Checks",
        "Yoga & Flexibility",
        "Strength Training",
        "Cardio & Endurance",
        "Recovery & Wellness"
      ],
      "trending_hashtags": ["#fitness", "#workout", "#gym", "#sports", "#health", "#training", "#bodybuilding", "#yoga"]
    }
  },
  "content_types": [
    {"id": "educational", "name": "Educational/Tutorial", "icon": "🎓"},
    {"id": "entertainment", "name": "Entertainment/Comedy", "icon": "😂"},
    {"id": "lifestyle", "name": "Lifestyle/Personal", "icon": "✨"},
    {"id": "reviews", "name": "Product Reviews", "icon": "⭐"},
    {"id": "bts", "name": "Behind-the-Scenes", "icon": "🎬"},
    {"id": "trends", "name": "Challenges/Trends", "icon": "🔥"}
  ],
  "platforms": [
    {"id": "tiktok", "name": "TikTok", "icon": "🎵", "color": "#FF0050"},
    {"id": "instagram", "name": "Instagram Reels", "icon": "📸", "color": "#E4405F"},
    {"id": "youtube", "name": "YouTube Shorts", "icon": "▶️", "color": "#FF0000"},
    {"id": "all", "name": "All Platforms", "icon": "🌐", "color": "#6366F1"}
  ],
  "onboarding_steps": [
    {"id": "welcome", "title": "Welcome", "description": "Get started with personalized content discovery"},
    {"id": "content_type", "title": "Content Style", "description": "What type of content do you create?"},
    {"id": "topics", "title": "Main Topics", "description": "Choose your content focus areas"},
    {"id": "subtopics", "title": "Subtopics", "description": "Get more specific with your interests"},
    {"id": "custom", "title": "Custom Topics", "description": "Add your unique niches"},
    {"id": "platforms", "title": "Platforms", "description": "Where do you create content?"},
    {"id": "summary", "title": "Complete", "description": "Your personalized setup is ready!"}
  ]
};

// User selections state
let userSelections = {
  contentTypes: [],
  mainTopics: [],
  subtopics: [],
  customTopics: [],
  platforms: []
};

// Current step tracking
let currentStep = 0;
const steps = ['welcome', 'content_type', 'topics', 'subtopics', 'custom', 'platforms', 'summary'];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  updateProgressBar();
  populateContentTypes();
  populateMainTopics();
  populatePlatforms();
  setupCustomTopicInput();
  
  // Add event listeners to navigation buttons
  setupNavigationButtons();
}

function setupNavigationButtons() {
  // Add event listeners as backup to onclick attributes
  document.addEventListener('click', function(e) {
    if (e.target.matches('[onclick*="nextStep"]')) {
      e.preventDefault();
      nextStep();
    } else if (e.target.matches('[onclick*="prevStep"]')) {
      e.preventDefault();
      prevStep();
    } else if (e.target.matches('[onclick*="completeOnboarding"]')) {
      e.preventDefault();
      completeOnboarding();
    } else if (e.target.matches('[onclick*="addCustomTopic"]')) {
      e.preventDefault();
      addCustomTopic();
    }
  });
}

function updateProgressBar() {
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  const percentage = ((currentStep + 1) / steps.length) * 100;
  progressFill.style.width = percentage + '%';
  progressText.textContent = `Step ${currentStep + 1} of ${steps.length}`;
}

function nextStep() {
  console.log('nextStep called, current step:', currentStep);
  
  if (currentStep < steps.length - 1) {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      console.log('Validation failed for step:', steps[currentStep]);
      return;
    }
    
    console.log('Validation passed, proceeding to next step');
    
    // Hide current step
    document.getElementById(`step-${steps[currentStep]}`).classList.remove('active');
    
    // Move to next step
    currentStep++;
    
    // Show next step
    document.getElementById(`step-${steps[currentStep]}`).classList.add('active');
    
    // Update progress bar
    updateProgressBar();
    
    // Handle special logic for certain steps
    if (steps[currentStep] === 'subtopics') {
      populateSubtopics();
    } else if (steps[currentStep] === 'summary') {
      populateSummary();
    }
    
    console.log('Advanced to step:', steps[currentStep]);
  }
}

function prevStep() {
  if (currentStep > 0) {
    // Hide current step
    document.getElementById(`step-${steps[currentStep]}`).classList.remove('active');
    
    // Move to previous step
    currentStep--;
    
    // Show previous step
    document.getElementById(`step-${steps[currentStep]}`).classList.add('active');
    
    // Update progress bar
    updateProgressBar();
  }
}

function validateCurrentStep() {
  console.log('Validating step:', steps[currentStep]);
  console.log('User selections:', userSelections);
  
  switch (steps[currentStep]) {
    case 'content_type':
      const contentTypeValid = userSelections.contentTypes.length > 0;
      console.log('Content type validation:', contentTypeValid, userSelections.contentTypes);
      return contentTypeValid;
    case 'topics':
      const topicsValid = userSelections.mainTopics.length > 0;
      console.log('Topics validation:', topicsValid, userSelections.mainTopics);
      return topicsValid;
    case 'subtopics':
      const subtopicsValid = userSelections.subtopics.length > 0;
      console.log('Subtopics validation:', subtopicsValid, userSelections.subtopics);
      return subtopicsValid;
    case 'platforms':
      const platformsValid = userSelections.platforms.length > 0;
      console.log('Platforms validation:', platformsValid, userSelections.platforms);
      return platformsValid;
    default:
      return true;
  }
}

function populateContentTypes() {
  const grid = document.getElementById('contentTypeGrid');
  
  appData.content_types.forEach(type => {
    const card = document.createElement('div');
    card.className = 'selection-card';
    card.setAttribute('data-type-id', type.id);
    card.addEventListener('click', () => toggleContentType(type.id, card));
    
    card.innerHTML = `
      <span class="selection-card-icon">${type.icon}</span>
      <div class="selection-card-title">${type.name}</div>
    `;
    
    grid.appendChild(card);
  });
}

function toggleContentType(typeId, element) {
  console.log('Toggling content type:', typeId);
  const index = userSelections.contentTypes.indexOf(typeId);
  
  if (index === -1) {
    userSelections.contentTypes.push(typeId);
    element.classList.add('selected');
  } else {
    userSelections.contentTypes.splice(index, 1);
    element.classList.remove('selected');
  }
  
  console.log('Content types after toggle:', userSelections.contentTypes);
  updateNextButton('contentTypeNext', userSelections.contentTypes.length > 0);
}

function populateMainTopics() {
  const grid = document.getElementById('mainTopicsGrid');
  
  Object.keys(appData.content_topics).forEach(topicKey => {
    const topic = appData.content_topics[topicKey];
    const card = document.createElement('div');
    card.className = 'selection-card topic-card';
    card.setAttribute('data-topic-key', topicKey);
    card.addEventListener('click', () => toggleMainTopic(topicKey, card));
    
    card.innerHTML = `
      <span class="selection-card-icon">${topic.icon}</span>
      <div class="selection-card-title">${topic.name}</div>
      <div class="selection-card-description">${topic.description}</div>
    `;
    
    grid.appendChild(card);
  });
}

function toggleMainTopic(topicKey, element) {
  console.log('Toggling main topic:', topicKey);
  const index = userSelections.mainTopics.indexOf(topicKey);
  
  if (index === -1 && userSelections.mainTopics.length < 5) {
    userSelections.mainTopics.push(topicKey);
    element.classList.add('selected');
  } else if (index !== -1) {
    userSelections.mainTopics.splice(index, 1);
    element.classList.remove('selected');
  }
  
  console.log('Main topics after toggle:', userSelections.mainTopics);
  updateNextButton('mainTopicsNext', userSelections.mainTopics.length > 0);
}

function populateSubtopics() {
  const container = document.getElementById('subtopicsContainer');
  container.innerHTML = '';
  
  userSelections.mainTopics.forEach(topicKey => {
    const topic = appData.content_topics[topicKey];
    
    const section = document.createElement('div');
    section.className = 'subtopic-section';
    
    const title = document.createElement('h3');
    title.className = 'subtopic-title';
    title.innerHTML = `${topic.icon} ${topic.name}`;
    
    const grid = document.createElement('div');
    grid.className = 'subtopic-grid';
    
    topic.subtopics.forEach(subtopic => {
      const item = document.createElement('div');
      item.className = 'subtopic-item';
      item.textContent = subtopic;
      item.addEventListener('click', () => toggleSubtopic(subtopic, item));
      grid.appendChild(item);
    });
    
    section.appendChild(title);
    section.appendChild(grid);
    container.appendChild(section);
  });
}

function toggleSubtopic(subtopic, element) {
  console.log('Toggling subtopic:', subtopic);
  const index = userSelections.subtopics.indexOf(subtopic);
  
  if (index === -1) {
    userSelections.subtopics.push(subtopic);
    element.classList.add('selected');
  } else {
    userSelections.subtopics.splice(index, 1);
    element.classList.remove('selected');
  }
  
  console.log('Subtopics after toggle:', userSelections.subtopics);
  updateNextButton('subtopicsNext', userSelections.subtopics.length > 0);
}

function setupCustomTopicInput() {
  const input = document.getElementById('customTopicInput');
  if (input) {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomTopic();
      }
    });
  }
}

function addCustomTopic() {
  const input = document.getElementById('customTopicInput');
  const topic = input.value.trim();
  
  console.log('Adding custom topic:', topic);
  
  if (topic && !userSelections.customTopics.includes(topic)) {
    userSelections.customTopics.push(topic);
    input.value = '';
    updateCustomTopicsList();
  }
}

function removeCustomTopic(topic) {
  const index = userSelections.customTopics.indexOf(topic);
  if (index !== -1) {
    userSelections.customTopics.splice(index, 1);
    updateCustomTopicsList();
  }
}

function updateCustomTopicsList() {
  const list = document.getElementById('customTopicsList');
  list.innerHTML = '';
  
  userSelections.customTopics.forEach(topic => {
    const tag = document.createElement('div');
    tag.className = 'custom-topic-tag';
    tag.innerHTML = `
      ${topic}
      <span class="custom-topic-remove" onclick="removeCustomTopic('${topic}')">×</span>
    `;
    list.appendChild(tag);
  });
}

function populatePlatforms() {
  const grid = document.getElementById('platformGrid');
  
  appData.platforms.forEach(platform => {
    const card = document.createElement('div');
    card.className = 'platform-card';
    card.setAttribute('data-platform-id', platform.id);
    card.addEventListener('click', () => togglePlatform(platform.id, card));
    
    card.innerHTML = `
      <span class="platform-icon">${platform.icon}</span>
      <div class="platform-name">${platform.name}</div>
    `;
    
    grid.appendChild(card);
  });
}

function togglePlatform(platformId, element) {
  console.log('Toggling platform:', platformId);
  const index = userSelections.platforms.indexOf(platformId);
  
  if (index === -1) {
    userSelections.platforms.push(platformId);
    element.classList.add('selected');
  } else {
    userSelections.platforms.splice(index, 1);
    element.classList.remove('selected');
  }
  
  console.log('Platforms after toggle:', userSelections.platforms);
  updateNextButton('platformNext', userSelections.platforms.length > 0);
}

function updateNextButton(buttonId, enabled) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = !enabled;
    console.log('Updated button', buttonId, 'enabled:', enabled);
  }
}

function populateSummary() {
  // Populate content types
  const contentTypesContainer = document.getElementById('summaryContentTypes');
  if (contentTypesContainer) {
    contentTypesContainer.innerHTML = '';
    userSelections.contentTypes.forEach(typeId => {
      const type = appData.content_types.find(t => t.id === typeId);
      if (type) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = type.name;
        contentTypesContainer.appendChild(tag);
      }
    });
  }
  
  // Populate main topics
  const mainTopicsContainer = document.getElementById('summaryMainTopics');
  if (mainTopicsContainer) {
    mainTopicsContainer.innerHTML = '';
    userSelections.mainTopics.forEach(topicKey => {
      const topic = appData.content_topics[topicKey];
      if (topic) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = topic.name;
        mainTopicsContainer.appendChild(tag);
      }
    });
  }
  
  // Populate platforms
  const platformsContainer = document.getElementById('summaryPlatforms');
  if (platformsContainer) {
    platformsContainer.innerHTML = '';
    userSelections.platforms.forEach(platformId => {
      const platform = appData.platforms.find(p => p.id === platformId);
      if (platform) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = platform.name;
        platformsContainer.appendChild(tag);
      }
    });
  }
  
  // Generate hashtag recommendations
  generateHashtagRecommendations();
}

function generateHashtagRecommendations() {
  const container = document.getElementById('hashtagStrategy');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Collect all hashtags from selected topics
  let allHashtags = [];
  userSelections.mainTopics.forEach(topicKey => {
    const topic = appData.content_topics[topicKey];
    if (topic && topic.trending_hashtags) {
      allHashtags = allHashtags.concat(topic.trending_hashtags);
    }
  });
  
  // Remove duplicates and limit to top recommendations
  const uniqueHashtags = [...new Set(allHashtags)];
  const topHashtags = uniqueHashtags.slice(0, 15);
  
  // Create hashtag categories
  const categories = [
    {
      title: 'Primary Hashtags (Use in every post)',
      hashtags: topHashtags.slice(0, 5)
    },
    {
      title: 'Secondary Hashtags (Mix and match)',
      hashtags: topHashtags.slice(5, 10)
    },
    {
      title: 'Niche Hashtags (For targeted reach)',
      hashtags: topHashtags.slice(10, 15)
    }
  ];
  
  categories.forEach(category => {
    if (category.hashtags.length > 0) {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'hashtag-category';
      
      const title = document.createElement('div');
      title.className = 'hashtag-category-title';
      title.textContent = category.title;
      
      const hashtagList = document.createElement('div');
      hashtagList.className = 'hashtag-list';
      
      category.hashtags.forEach(hashtag => {
        const hashtagSpan = document.createElement('span');
        hashtagSpan.className = 'hashtag';
        hashtagSpan.textContent = hashtag;
        hashtagList.appendChild(hashtagSpan);
      });
      
      categoryDiv.appendChild(title);
      categoryDiv.appendChild(hashtagList);
      container.appendChild(categoryDiv);
    }
  });
}

function completeOnboarding() {
  console.log('Completing onboarding with selections:', userSelections);
  
  // Show success message
  alert('🎉 Onboarding complete! Welcome to ViralScope - your personalized content discovery platform is ready to help you create viral content!');
  
  // In a real app, this would redirect to the main dashboard
  // For demo purposes, we'll show a final message
  const summaryStep = document.getElementById('step-summary');
  if (summaryStep) {
    const successMessage = document.createElement('div');
    successMessage.style.cssText = 'margin-top: 2rem; padding: 1rem; background: var(--color-bg-3); border-radius: var(--radius-lg); text-align: center;';
    successMessage.innerHTML = '<strong>✅ Setup Complete!</strong><br>You would now be redirected to your personalized dashboard.';
    summaryStep.querySelector('.step-content').appendChild(successMessage);
  }
}

// Make functions globally available for onclick handlers
window.nextStep = nextStep;
window.prevStep = prevStep;
window.completeOnboarding = completeOnboarding;
window.addCustomTopic = addCustomTopic;
window.removeCustomTopic = removeCustomTopic;