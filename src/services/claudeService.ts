import { toast } from "sonner";

// Create a service with methods to interact with Claude API
class ClaudeService {
  // Method to generate a test/quiz for a lesson
  async generateLessonTest(subject: string, topic: string) {
    try {
      // First, check if we have cached quiz questions
      const cachedQuiz = localStorage.getItem(`quiz_${subject}_${topic.replace(/\s+/g, '_')}`);
      if (cachedQuiz) {
        return JSON.parse(cachedQuiz);
      }

      // Get class information if available
      const className = localStorage.getItem('selectedClass') || '10';
      
      // Use fallback data since we're not making actual API calls
      const quizData = this.getFallbackQuizQuestions(subject, topic);
      
      // Cache the quiz questions
      localStorage.setItem(`quiz_${subject}_${topic.replace(/\s+/g, '_')}`, JSON.stringify(quizData));
      
      return quizData;
    } catch (error) {
      console.error('Error generating lesson test:', error);
      // Return fallback data
      return this.getFallbackQuizQuestions(subject, topic);
    }
  }

  // Method to get subject topics based on curriculum details
  async getSubjectTopics(subject: string, className: string) {
    try {
      // First, check if we have cached topics
      const cachedTopics = localStorage.getItem(`topics_${subject}_${className}`);
      if (cachedTopics) {
        return JSON.parse(cachedTopics);
      }

      // Use fallback data since we're not making actual API calls
      const topicsData = this.getFallbackTopics(subject, className);
      
      // Cache the topics
      localStorage.setItem(`topics_${subject}_${className}`, JSON.stringify(topicsData));
      
      return topicsData;
    } catch (error) {
      console.error('Error with Claude API:', error);
      // Return fallback data
      return this.getFallbackTopics(subject, className);
    }
  }

  // Method to get lesson content
  async getLessonContent(subject: string, topic: string, className = '10') {
    try {
      // First, check if we have cached lesson content
      const cachedContent = localStorage.getItem(`lesson_${subject}_${topic.replace(/\s+/g, '_')}`);
      if (cachedContent) {
        return JSON.parse(cachedContent);
      }

      // Use subject-specific fallback data
      const lessonData = this.getFallbackLessonContent(subject, topic);
      
      // Cache the lesson content
      localStorage.setItem(`lesson_${subject}_${topic.replace(/\s+/g, '_')}`, JSON.stringify(lessonData));
      
      return lessonData;
    } catch (error) {
      console.error('Error with Claude API for lesson:', error);
      // Return fallback data
      return this.getFallbackLessonContent(subject, topic);
    }
  }

  // Method to get quiz questions
  async getQuizQuestions(subject: string, topic: string, questionCount = 10) {
    try {
      // First, check if we have cached quiz questions
      const cachedQuiz = localStorage.getItem(`quiz_${subject}_${topic.replace(/\s+/g, '_')}`);
      if (cachedQuiz) {
        return JSON.parse(cachedQuiz);
      }

      // Use fallback data based on subject
      const quizData = this.getFallbackQuizQuestions(subject, topic);
      
      // Cache the quiz questions
      localStorage.setItem(`quiz_${subject}_${topic.replace(/\s+/g, '_')}`, JSON.stringify(quizData));
      
      return quizData;
    } catch (error) {
      console.error('Error with Claude API for quiz:', error);
      // Return fallback data
      return this.getFallbackQuizQuestions(subject, topic);
    }
  }

  // Method to get fallback lesson content based on subject
  getFallbackLessonContent(subject: string, topic: string) {
    // Define subject-specific content
    const subjectLower = subject.toLowerCase();
    
    if (subjectLower.includes('math')) {
      return this.getMathLessonContent(topic);
    } else if (subjectLower.includes('science') || subjectLower.includes('physics') || subjectLower.includes('chemistry') || subjectLower.includes('biology')) {
      return this.getScienceLessonContent(topic, subjectLower);
    } else if (subjectLower.includes('history') || subjectLower.includes('social') || subjectLower.includes('civics')) {
      return this.getSocialStudiesLessonContent(topic);
    } else if (subjectLower.includes('english') || subjectLower.includes('language')) {
      return this.getEnglishLessonContent(topic);
    } else if (subjectLower.includes('computer') || subjectLower.includes('cs') || subjectLower.includes('programming')) {
      return this.getComputerScienceLessonContent(topic);
    } else {
      // Generic content for other subjects
      return this.getGenericLessonContent(subject, topic);
    }
  }

  // Mathematics lesson content
  getMathLessonContent(topic: string) {
    const normalizedTopic = topic.toLowerCase();
    
    // Math-specific lesson content
    return {
      title: topic,
      keyPoints: [
        "A quadratic equation has the form ax² + bx + c = 0, where a ≠ 0",
        "The quadratic formula x = (-b ± √(b² - 4ac))/2a gives the solutions",
        "The discriminant b² - 4ac determines the nature of roots",
        "Quadratic equations can be solved by factoring, completing the square, or using the quadratic formula",
        "Quadratic functions create parabolas when graphed",
        "Real-world applications include projectile motion, area optimization, and economic modeling"
      ],
      explanation: [
        "Quadratic equations are polynomial equations of the second degree, meaning the highest exponent of the variable is 2. The standard form is ax² + bx + c = 0, where a, b, and c are constants and a ≠ 0. These equations appear frequently in mathematics and have numerous applications in physics, engineering, and economics.",
        "There are multiple methods to solve quadratic equations. The most common approaches are factoring (when the equation can be easily factored), completing the square (a technique that transforms the equation), and the quadratic formula x = (-b ± √(b² - 4ac))/2a which works for all quadratic equations.",
        "The discriminant, calculated as b² - 4ac, helps determine the nature of the roots. If the discriminant is positive, there are two distinct real roots. If it equals zero, there is exactly one real root (a repeated root). If the discriminant is negative, there are two complex conjugate roots.",
        "When graphed, a quadratic function f(x) = ax² + bx + c forms a parabola. The coefficient 'a' determines whether the parabola opens upward (a > 0) or downward (a < 0). The vertex of the parabola represents either the minimum or maximum value of the function."
      ],
      examples: [
        {
          title: "Solving by Factoring",
          content: "Example: Solve x² - 5x + 6 = 0\n\nSolution: We can factor this as (x - 2)(x - 3) = 0\nUsing the zero product property: x - 2 = 0 or x - 3 = 0\nTherefore, x = 2 or x = 3"
        },
        {
          title: "Using the Quadratic Formula",
          content: "Example: Solve 2x² - 7x + 3 = 0\n\nSolution: Using the quadratic formula with a = 2, b = -7, and c = 3:\nx = (7 ± √(49 - 24))/4\nx = (7 ± √25)/4\nx = (7 ± 5)/4\nSo x = 3 or x = 0.5"
        },
        {
          title: "Word Problem Application",
          content: "Example: A farmer has 100 meters of fencing to enclose a rectangular garden adjacent to a river. If the river side needs no fencing, what dimensions will maximize the garden's area?\n\nSolution: Let x be the width. Then (100 - 2x)/2 is the length.\nArea = x × length = x(100 - 2x)/2 = 50x - x²\nTo maximize area, we take the derivative: dA/dx = 50 - 2x\nSetting equal to zero: 50 - 2x = 0\nSolving: x = 25\nSo the dimensions should be 25m × 25m for maximum area of 625 square meters."
        }
      ],
      visualAids: [
        {
          title: "Parabola Graph",
          description: "A visual representation of y = x² - 4x + 3, showing the parabola opening upward with vertex at (2, -1) and x-intercepts at x = 1 and x = 3",
          visualType: "Graph"
        },
        {
          title: "Discriminant Cases",
          description: "Three parabolas showing the three cases for the discriminant: two distinct real roots (b² - 4ac > 0), one repeated real root (b² - 4ac = 0), and no real roots (b² - 4ac < 0)",
          visualType: "Comparative Diagram"
        }
      ],
      activities: [
        {
          title: "Projectile Motion Experiment",
          instructions: "Using a ball launcher and measuring tape, launch a ball at different angles. Record the maximum height and distance traveled. Use quadratic equations to model the path and compare your theoretical predictions with actual measurements.",
          learningOutcome: "Understanding how quadratic equations model real physical phenomena"
        },
        {
          title: "Graphical Exploration",
          instructions: "Using graphing software, investigate how changing the coefficients a, b, and c affects the shape, position, and orientation of the parabola y = ax² + bx + c. Record your observations about the vertex, axis of symmetry, and intercepts.",
          learningOutcome: "Visualizing the relationship between algebraic expressions and their graphical representations"
        }
      ],
      summary: "Quadratic equations form a fundamental part of algebra with extensive applications across various fields. The ability to recognize, manipulate, and solve these equations allows us to model curved relationships and optimize values in real-world scenarios. The various solution methods (factoring, completing the square, and the quadratic formula) provide flexibility in approaching different problems, while the discriminant offers quick insight into the nature of solutions. Understanding parabolas as the graphical representation of quadratic functions helps in visualizing and interpreting these mathematical relationships.",
      textbookReferences: [
        {
          chapter: "8",
          pageNumbers: "144-158",
          description: "Quadratic Equations - Methods of Solution"
        },
        {
          chapter: "9",
          pageNumbers: "160-172",
          description: "Applications of Quadratic Equations"
        }
      ],
      interestingFacts: [
        "Ancient Babylonian mathematicians could solve quadratic equations as early as 2000 BCE using geometric methods",
        "The quadratic formula was first published in its modern form by Abraham bar Hiyya Ha-Nasi in his book 'Liber embadorum' published in 1145 CE",
        "The word 'quadratic' comes from the Latin word 'quadratum' meaning square, referring to the squared term in the equation"
      ]
    };
  }

  // Science lesson content
  getScienceLessonContent(topic: string, specificSubject: string) {
    // Science-specific lesson content
    // Customize based on specifics (e.g., physics, chemistry, biology)
    if (specificSubject.includes('physics')) {
      return {
        title: topic,
        keyPoints: [
          "Newton's three laws of motion govern the relationship between a body and the forces acting upon it",
          "First Law: An object will remain at rest or in uniform motion unless acted upon by an external force",
          "Second Law: Force equals mass times acceleration (F = ma)",
          "Third Law: For every action, there is an equal and opposite reaction",
          "These laws form the foundation of classical mechanics",
          "They explain everyday phenomena from walking to rocket propulsion"
        ],
        explanation: [
          "Sir Isaac Newton's laws of motion, published in 1687, revolutionized our understanding of the physical world. These three fundamental principles describe the relationship between the motion of an object and the forces acting on it, forming the foundation of classical mechanics.",
          "Newton's First Law, often called the law of inertia, states that an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force. This explains why objects in space continue moving without slowing down and why passengers in a car feel pushed back when the car suddenly accelerates.",
          "Newton's Second Law quantifies the relationship between force, mass, and acceleration. It states that the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. Mathematically, this is expressed as F = ma. This law explains why it's harder to push a heavy object than a light one, and why the same force applied to objects of different masses results in different accelerations.",
          "Newton's Third Law states that for every action, there is an equal and opposite reaction. When one object exerts a force on a second object, the second object exerts an equal and opposite force on the first. This principle explains how birds fly, how rockets launch, and even how we walk by pushing against the ground."
        ],
        examples: [
          {
            title: "First Law Example: Seat Belts",
            content: "When a car suddenly stops, passengers continue moving forward due to inertia. Seat belts prevent passengers from continuing their forward motion, protecting them from injury."
          },
          {
            title: "Second Law Example: Pushing Objects",
            content: "If you push a shopping cart with a force of 20 N, and it has a mass of 10 kg, it will accelerate at 2 m/s². If you apply the same force to a cart with a mass of 20 kg, it will accelerate at only 1 m/s²."
          },
          {
            title: "Third Law Example: Rocket Propulsion",
            content: "A rocket expels gas backwards (action), creating a forward thrust on the rocket (reaction). This principle allows rockets to accelerate in the vacuum of space where there is nothing to push against."
          }
        ],
        visualAids: [
          {
            title: "Forces Diagram",
            description: "Visual representation of forces acting on an object and the resulting motion, showing vectors for force, acceleration, and velocity",
            visualType: "Diagram"
          },
          {
            title: "Action-Reaction Pairs",
            description: "Illustrations of various action-reaction pairs in everyday situations, such as walking, swimming, and rocket propulsion",
            visualType: "Comparative Diagram"
          }
        ],
        activities: [
          {
            title: "Balloon Rocket Experiment",
            instructions: "Attach a balloon to a straw threaded on a string. Inflate the balloon and release it to observe rocket propulsion in action. Measure the distance traveled with different balloon sizes.",
            learningOutcome: "Understanding Newton's Third Law through practical demonstration"
          },
          {
            title: "Inertia Demonstrations",
            instructions: "Place a card with a coin on top on your finger. Quickly flick the card away and observe how the coin drops straight down due to inertia.",
            learningOutcome: "Experiencing Newton's First Law in action"
          }
        ],
        summary: "Newton's laws of motion provide a framework for understanding how objects move and interact with forces. The first law describes the principle of inertia, where objects resist changes to their motion. The second law quantifies how force affects motion through the equation F = ma. The third law explains the paired nature of forces, where every action has an equal and opposite reaction. Together, these laws explain countless phenomena in our daily lives and form the cornerstone of classical physics.",
        textbookReferences: [
          {
            chapter: "5",
            pageNumbers: "98-112",
            description: "Newton's Laws of Motion - Fundamentals"
          },
          {
            chapter: "6",
            pageNumbers: "113-128",
            description: "Applications of Newton's Laws"
          }
        ],
        interestingFacts: [
          "Newton developed his laws while Cambridge University was closed due to the Great Plague of London in 1665-1666",
          "The concept of inertia was first introduced by Galileo Galilei, about 50 years before Newton formalized it in his first law",
          "Astronauts in space stations experience weightlessness not because gravity is absent, but because they are in continuous free fall around Earth"
        ]
      };
    } else if (specificSubject.includes('chemistry')) {
      return {
        title: topic,
        keyPoints: [
          "The periodic table organizes elements by increasing atomic number",
          "Elements are arranged in periods (rows) and groups (columns)",
          "Elements in the same group have similar chemical properties",
          "The periodic table is divided into metals, nonmetals, and metalloids",
          "Electron configuration determines an element's position in the periodic table",
          "Periodic trends include atomic radius, ionization energy, and electronegativity"
        ],
        explanation: [
          "The periodic table is one of the most significant achievements in science, offering a logical organization of all known chemical elements. Developed by Dmitri Mendeleev in 1869, the modern periodic table arranges elements by increasing atomic number (the number of protons in an atom's nucleus) from left to right and top to bottom.",
          "Elements are organized into periods (horizontal rows) and groups (vertical columns). Elements in the same group have similar chemical properties because they have the same number of electrons in their outermost energy level or valence shell. This organization allows scientists to predict the behavior of elements based on their position in the table.",
          "The periodic table is broadly divided into metals (left and middle of the table), nonmetals (upper right), and metalloids (along the zigzag line separating metals and nonmetals). Metals generally conduct electricity, are malleable and ductile, and tend to lose electrons in chemical reactions. Nonmetals typically do not conduct electricity well, are brittle in solid form, and tend to gain electrons. Metalloids have properties intermediate between metals and nonmetals.",
          "The modern periodic table is based on the periodic law, which states that when elements are arranged by increasing atomic number, there is a periodic repetition of their physical and chemical properties. This periodicity is directly related to the electron configuration of atoms. Elements in the same group have similar valence electron configurations, which explains their similar chemical behavior."
        ],
        examples: [
          {
            title: "Group 1: Alkali Metals",
            content: "Elements: Lithium (Li), Sodium (Na), Potassium (K), Rubidium (Rb), Cesium (Cs), Francium (Fr)\n\nCommon properties:\n- One valence electron\n- Highly reactive metals\n- React vigorously with water to produce hydrogen gas and metal hydroxides\n- Form +1 ions in compounds\n- Soft and have low melting points\n\nExample reaction: 2Na + 2H₂O → 2NaOH + H₂"
          },
          {
            title: "Group 17: Halogens",
            content: "Elements: Fluorine (F), Chlorine (Cl), Bromine (Br), Iodine (I), Astatine (At), Tennessine (Ts)\n\nCommon properties:\n- Seven valence electrons\n- Highly reactive nonmetals\n- Exist as diatomic molecules (F₂, Cl₂, etc.)\n- Form -1 ions (halides) in compounds\n- React with metals to form salts\n\nExample reaction: Cl₂ + 2KI → 2KCl + I₂"
          }
        ],
        visualAids: [
          {
            title: "Modern Periodic Table",
            description: "Color-coded periodic table showing metals, nonmetals, and metalloids, with atomic numbers, symbols, atomic weights, and electron configurations for each element",
            visualType: "Chart"
          },
          {
            title: "Electron Orbital Filling",
            description: "Diagram showing the order of filling of electron orbitals (1s, 2s, 2p, etc.) and how this relates to the structure of the periodic table",
            visualType: "Diagram"
          }
        ],
        activities: [
          {
            title: "Element Identification Lab",
            instructions: "Observe the physical properties and chemical reactions of several unknown elemental samples. Based on your observations and reference to the periodic table, identify each element and explain your reasoning.",
            learningOutcome: "Applying knowledge of periodic trends to identify elements based on their properties"
          },
          {
            title: "Periodic Table Puzzle",
            instructions: "Using a blank periodic table grid and element cards containing properties (but not names), place each element in its correct position based on the provided information about atomic number, electron configuration, and chemical behavior.",
            learningOutcome: "Understanding the logical organization of the periodic table and the relationship between electron configuration and element position"
          }
        ],
        summary: "The periodic table stands as one of science's most powerful organizational tools, arranging elements by atomic number in a way that reveals patterns in their properties. This arrangement into periods and groups creates a roadmap for understanding chemical behavior, as elements in the same group share similar properties due to their valence electron configurations. The division into metals, nonmetals, and metalloids further helps categorize elements by their physical and chemical characteristics. Periodic trends such as atomic radius, ionization energy, and electronegativity provide additional insights into element behavior. The predictive power of the periodic table has allowed scientists to discover new elements and understand the fundamental nature of matter.",
        textbookReferences: [
          {
            chapter: "5",
            pageNumbers: "98-115",
            description: "Periodic Table and Periodic Properties"
          },
          {
            chapter: "6",
            pageNumbers: "116-130",
            description: "Chemical Bonding and Molecular Structure"
          }
        ],
        interestingFacts: [
          "When Mendeleev created his periodic table, he left gaps for undiscovered elements and accurately predicted their properties, including gallium, scandium, and germanium",
          "Technetium was the first artificially produced element and was discovered in 1937, filling a gap in the periodic table",
          "Hydrogen is usually placed in Group 1 but doesn't fully belong there - it has properties similar to both alkali metals and halogens, making it unique in the periodic table"
        ]
      };
    } else {
      // Regular science or biology
      return {
        title: topic,
        keyPoints: [
          "Cells are the fundamental units of life",
          "All cells have a cell membrane, cytoplasm, and genetic material",
          "Prokaryotic cells lack a nucleus, while eukaryotic cells have a nucleus",
          "Plant cells have cell walls and chloroplasts, which animal cells lack",
          "Cells perform essential functions including metabolism, growth, and reproduction",
          "Cell theory states all living things are composed of cells, cells are the basic units of structure and function, and all cells come from pre-existing cells"
        ],
        explanation: [
          "Cells are the basic structural, functional, and biological units of all known living organisms. They are the smallest units of life that can replicate independently. The study of cells is called cell biology or cytology.",
          "Cells can be classified into two major types: prokaryotic and eukaryotic. Prokaryotic cells, found in bacteria and archaea, are simpler and smaller, typically 0.1-5.0 micrometers in diameter. They lack a membrane-bound nucleus and other membrane-bound organelles. Eukaryotic cells, found in plants, animals, fungi, and protists, are larger and more complex, typically 10-100 micrometers in diameter. They contain a membrane-bound nucleus that houses genetic material and various membrane-bound organelles that perform specialized functions.",
          "All cells are surrounded by a cell membrane (plasma membrane), a phospholipid bilayer with embedded proteins that regulates what enters and leaves the cell. The interior of the cell contains cytoplasm, a gel-like substance where various cellular components are suspended. Within the cytoplasm of eukaryotic cells are organelles such as mitochondria (powerhouses of the cell), ribosomes (protein factories), endoplasmic reticulum (protein processing and transport), Golgi apparatus (protein packaging and distribution), and lysosomes (digestive vesicles).",
          "Plant cells differ from animal cells in several ways. They have a rigid cell wall surrounding the cell membrane, providing structural support. They also contain chloroplasts, organelles that capture sunlight and convert it into chemical energy through photosynthesis. Additionally, plant cells often have a large central vacuole that maintains turgor pressure and stores nutrients and waste products."
        ],
        examples: [
          {
            title: "Cell Types Comparison",
            content: "Prokaryotic cell (e.g., bacteria):\n- No nucleus\n- No membrane-bound organelles\n- Circular DNA\n- Size: 0.1-5.0 μm\n\nEukaryotic cell (e.g., human cell):\n- Has a nucleus\n- Has membrane-bound organelles\n- Linear DNA organized into chromosomes\n- Size: 10-100 μm"
          },
          {
            title: "Plant vs. Animal Cell",
            content: "Plant Cell unique features:\n- Cell wall (made of cellulose)\n- Chloroplasts for photosynthesis\n- Large central vacuole\n- Generally rectangular shape\n\nAnimal Cell unique features:\n- No cell wall\n- No chloroplasts\n- Small, numerous vacuoles\n- Irregular shape\n- Has centrioles for cell division"
          }
        ],
        visualAids: [
          {
            title: "Cell Structure Diagram",
            description: "Detailed labeled diagrams of prokaryotic and eukaryotic cells, showing all major organelles and structures",
            visualType: "Diagram"
          },
          {
            title: "Plant vs. Animal Cell",
            description: "Side-by-side comparison of plant and animal cells, highlighting structural differences",
            visualType: "Comparative Diagram"
          }
        ],
        activities: [
          {
            title: "Microscopy Lab",
            instructions: "Use a microscope to observe prepared slides of different cell types (bacterial, plant, and animal). Draw what you observe and label the visible structures. Compare and contrast the different cell types.",
            learningOutcome: "Developing observational skills and understanding the structural differences between cell types"
          },
          {
            title: "Cell Model Creation",
            instructions: "Create a 3D model of a plant or animal cell using household materials. Label all organelles and be prepared to explain the function of each.",
            learningOutcome: "Reinforcing understanding of cell structure and organelle functions through creative application"
          }
        ],
        summary: "Cells are the fundamental units of life, with structures and functions that allow organisms to survive and thrive. The two main types—prokaryotic and eukaryotic—differ in complexity and organization, with eukaryotic cells containing membrane-bound organelles including a nucleus. Further distinctions exist between plant and animal cells, with plant cells having cell walls, chloroplasts, and large central vacuoles. Each cellular component serves specific functions, from energy production in mitochondria to protein synthesis at ribosomes. The coordinated activities of these components enable cells to perform essential life processes including metabolism, growth, response to stimuli, and reproduction. Understanding cell biology provides the foundation for comprehending how all living organisms function.",
        textbookReferences: [
          {
            chapter: "3",
            pageNumbers: "42-68",
            description: "Cell Structure and Function"
          },
          {
            chapter: "4",
            pageNumbers: "70-85",
            description: "Cell Organelles and Their Functions"
          }
        ],
        interestingFacts: [
          "The human body contains approximately 37.2 trillion cells",
          "If all the DNA in your body was unwound and stretched out, it would reach to the sun and back over 600 times",
          "Mitochondria have their own DNA, separate from the nucleus, and are believed to have originated as independent bacteria that were engulfed by larger cells in a process called endosymbiosis"
        ]
      };
    }
  }

  // Social Studies lesson content
  getSocialStudiesLessonContent(topic: string) {
    return {
      title: topic,
      keyPoints: [
        "The Indian Constitution is the longest written constitution of any sovereign country in the world",
        "It was adopted on November 26, 1949, and came into effect on January 26, 1950",
        "Dr. B.R. Ambedkar served as the Chairman of the Drafting Committee",
        "The Constitution establishes India as a sovereign, socialist, secular, democratic republic",
        "It provides fundamental rights, directive principles of state policy, and fundamental duties",
        "The Constitution has been amended 104 times since its adoption"
      ],
      explanation: [
        "The Constitution of India is the supreme law of India. It lays down the framework defining fundamental political principles, establishes the structure, procedures, powers, and duties of government institutions, and sets out fundamental rights, directive principles, and the duties of citizens. It is the longest written constitution of any sovereign country in the world, containing 448 articles in 25 parts, 12 schedules, 5 appendices, and 104 amendments.",
        "The Constitution was drafted by the Constituent Assembly, which was established in 1946. Dr. B.R. Ambedkar, known as the Father of the Indian Constitution, served as the Chairman of the Drafting Committee. The Constituent Assembly took almost three years (2 years, 11 months, and 18 days) to complete the historic document. The Constitution was adopted on November 26, 1949, and came into effect on January 26, 1950, which is celebrated as Republic Day in India.",
        "The Constitution establishes India as a sovereign, socialist, secular, democratic republic. It guarantees justice, equality, and liberty to all citizens and promotes fraternity among them. The words 'socialist' and 'secular' were added to the Preamble through the 42nd Amendment in 1976.",
        "The Constitution provides for a parliamentary form of government with a bicameral legislature at the center. The President is the constitutional head of state, while the Prime Minister, as the head of the Council of Ministers, exercises executive power. The Supreme Court of India is the highest judicial authority and acts as the guardian of the Constitution."
      ],
      examples: [
        {
          title: "Fundamental Rights",
          content: "Part III of the Constitution (Articles 12-35) guarantees fundamental rights to all citizens, including:\n\n- Right to Equality (Articles 14-18): Equality before law, prohibition of discrimination, equality of opportunity\n- Right to Freedom (Articles 19-22): Freedom of speech, expression, assembly, association, movement, residence, profession\n- Right against Exploitation (Articles 23-24): Prohibition of human trafficking, forced labor, and child labor\n- Right to Freedom of Religion (Articles 25-28): Freedom to practice and propagate religion\n- Cultural and Educational Rights (Articles 29-30): Protection of interests of minorities\n- Right to Constitutional Remedies (Article 32): Right to move the Supreme Court for enforcement of fundamental rights"
        },
        {
          title: "Directive Principles of State Policy",
          content: "Part IV of the Constitution (Articles 36-51) contains the Directive Principles of State Policy, which are guidelines for the government to create conditions for social, economic, and political justice. Though not enforceable in courts, these principles are fundamental in governance. Key principles include:\n\n- Equal justice and free legal aid\n- Organization of village panchayats\n- Right to work, education, and public assistance\n- Equal pay for equal work\n- Protection of environment and wildlife\n- Separation of judiciary from executive\n- Promotion of international peace and security"
        }
      ],
      visualAids: [
        {
          title: "Structure of Indian Government",
          description: "Diagram showing the three branches of government (legislative, executive, and judicial) and their relationships as established by the Constitution",
          visualType: "Organizational Chart"
        },
        {
          title: "Constitutional Timeline",
          description: "Visual timeline showing key dates in the development of the Indian Constitution, from the formation of the Constituent Assembly to major amendments",
          visualType: "Timeline"
        }
      ],
      activities: [
        {
          title: "Constitutional Values Debate",
          instructions: "Divide into groups and assign each group a fundamental right or directive principle. Have each group present arguments for why their assigned value is crucial for democracy and national development.",
          learningOutcome: "Understanding the importance of constitutional values in maintaining democracy and ensuring social justice"
        },
        {
          title: "Mock Parliament Session",
          instructions: "Conduct a mock parliamentary session where students take on roles as members of the Lok Sabha. Debate a proposed constitutional amendment, following parliamentary procedures as established in the Constitution.",
          learningOutcome: "Experiencing the democratic process and understanding how the Constitution guides legislative procedures"
        }
      ],
      summary: "The Constitution of India, adopted in 1949, is a comprehensive document that establishes India as a sovereign, socialist, secular, democratic republic. It defines the structure of government, outlines the fundamental rights and duties of citizens, and provides directive principles for governance. With its 448 articles, 25 parts, and 12 schedules, it is the longest written constitution in the world. The Constitution has shown remarkable adaptability through its 104 amendments, allowing it to address changing social, political, and economic realities while maintaining its core democratic values. As the supreme law of the land, it continues to guide India's journey as the world's largest democracy.",
      textbookReferences: [
        {
          chapter: "2",
          pageNumbers: "24-48",
          description: "The Making of the Indian Constitution"
        },
        {
          chapter: "3",
          pageNumbers: "50-72",
          description: "Fundamental Rights and Duties"
        }
      ],
      interestingFacts: [
        "The original Constitution of India was handwritten and calligraphed, not printed or typed. It was signed by 284 members of the Constituent Assembly",
        "The Indian Constitution borrowed concepts from various countries: parliamentary government from Britain, fundamental rights from the USA, directive principles from Ireland, and emergency provisions from Germany",
        "The original handwritten copies of the Constitution are kept in helium-filled cases in the Library of the Parliament of India"
      ]
    };
  }

  // English lesson content
  getEnglishLessonContent(topic: string) {
    return {
      title: topic,
      keyPoints: [
        "Poetry uses figurative language to express emotions, ideas, and experiences",
        "Literary devices include metaphor, simile, personification, alliteration, and imagery",
        "Poetic forms include sonnets, haiku, free verse, ballads, and epic poetry",
        "Meter and rhyme create rhythm and musicality in traditional poetry",
        "Poetry analysis involves examining theme, tone, structure, and language",
        "Poetry has evolved across cultures and time periods, reflecting social and historical contexts"
      ],
      explanation: [
        "Poetry is a form of literature that uses aesthetic and rhythmic qualities of language to evoke meanings beyond literal interpretation. It employs various literary devices and techniques to convey emotions, ideas, and experiences in a condensed, evocative form. Unlike prose, which follows natural speech patterns, poetry often uses line breaks, stanzas, rhythm
