import { Subject, Resource } from '../types/index.ts';

export const INITIAL_SUBJECTS: Subject[] = [
  // --- YEAR I (Common to all branches or branch specific) ---
  // Semester 1
  {
    id: 'subj-cse-s1-01',
    name: 'Engineering Mathematics I (Calculus & Linear Algebra)',
    code: 'MATH101',
    branch: 'CSE',
    academicYear: 'Year I',
    semester: 1,
    description: 'Matrices, Eigenvalues, Differential Calculus, Mean Value Theorems, and Multivariable Integration.'
  },
  {
    id: 'subj-cse-s1-02',
    name: 'Programming for Problem Solving with C',
    code: 'CS101',
    branch: 'CSE',
    academicYear: 'Year I',
    semester: 1,
    description: 'Algorithms, Flowcharts, Variables, Conditionals, Loops, Arrays, Pointers, Functions, and File I/O in C.'
  },
  {
    id: 'subj-cse-s1-03',
    name: 'Engineering Physics & Quantum Mechanics',
    code: 'PHY101',
    branch: 'CSE',
    academicYear: 'Year I',
    semester: 1,
    description: 'Wave optics, Lasers, Fiber Optics, Quantum Mechanics basics, and Semiconductor Physics.'
  },
  {
    id: 'subj-cse-s1-04',
    name: 'Basic Electrical & Electronics Engineering',
    code: 'EE101',
    branch: 'CSE',
    academicYear: 'Year I',
    semester: 1,
    description: 'DC circuits, AC circuits, Transformers, Operational Amplifiers, Diodes, and Transistors.'
  },

  // Semester 2
  {
    id: 'subj-cse-s2-01',
    name: 'Engineering Mathematics II (Differential Equations)',
    code: 'MATH102',
    branch: 'CSE',
    academicYear: 'Year I',
    semester: 2,
    description: 'Ordinary differential equations, Series solutions, Laplace transforms, and Vector calculus.'
  },
  {
    id: 'subj-cse-s2-02',
    name: 'Data Structures and Algorithms Fundamentals',
    code: 'CS102',
    branch: 'CSE',
    academicYear: 'Year I',
    semester: 2,
    description: 'Stacks, Queues, Linked Lists, Binary Trees, Searching, and Sorting algorithm analysis.'
  },
  {
    id: 'subj-cse-s2-03',
    name: 'Engineering Chemistry & Material Science',
    code: 'CHEM101',
    branch: 'CSE',
    academicYear: 'Year I',
    semester: 2,
    description: 'Electrochemistry, Corrosion, Polymers, Nanomaterials, and Spectroscopic techniques.'
  },
  {
    id: 'subj-cse-s2-04',
    name: 'Digital Logic and Computer Design',
    code: 'CS103',
    branch: 'CSE',
    academicYear: 'Year I',
    semester: 2,
    description: 'Boolean algebra, Logic gates, Combinational circuits, Karnaugh maps, Latches, and Flip-flops.'
  },

  // --- YEAR II ---
  // Semester 3
  {
    id: 'subj-cse-s3-01',
    name: 'Discrete Mathematical Structures',
    code: 'CS201',
    branch: 'CSE',
    academicYear: 'Year II',
    semester: 3,
    description: 'Set theory, Relations, Functions, Propositional logic, Graph theory, and Combinatorics.'
  },
  {
    id: 'subj-cse-s3-02',
    name: 'Object-Oriented Programming with Java',
    code: 'CS202',
    branch: 'CSE',
    academicYear: 'Year II',
    semester: 3,
    description: 'Encapsulation, Inheritance, Polymorphism, Abstract classes, Interfaces, Exceptions, and Multithreading.'
  },
  {
    id: 'subj-cse-s3-03',
    name: 'Computer Organization & Architecture',
    code: 'CS203',
    branch: 'CSE',
    academicYear: 'Year II',
    semester: 3,
    description: 'Instruction sets, Memory hierarchy, Cache mapping, ALU design, Pipelining, and I/O organization.'
  },
  {
    id: 'subj-cse-s3-04',
    name: 'Database Management Systems (DBMS)',
    code: 'CS204',
    branch: 'CSE',
    academicYear: 'Year II',
    semester: 3,
    description: 'Relational model, SQL, Normalization (1NF to BCNF), Transaction processing, Concurrency, and Indexing.'
  },

  // Semester 4
  {
    id: 'subj-cse-s4-01',
    name: 'Design and Analysis of Algorithms',
    code: 'CS205',
    branch: 'CSE',
    academicYear: 'Year II',
    semester: 4,
    description: 'Asymptotic notation, Divide and Conquer, Greedy algorithms, Dynamic programming, Graph algorithms, NP-completeness.'
  },
  {
    id: 'subj-cse-s4-02',
    name: 'Operating Systems',
    code: 'CS206',
    branch: 'CSE',
    academicYear: 'Year II',
    semester: 4,
    description: 'Processes, CPU Scheduling, Synchronization, Semaphores, Deadlocks, Virtual Memory, and File systems.'
  },
  {
    id: 'subj-cse-s4-03',
    name: 'Theory of Computation & Automata',
    code: 'CS207',
    branch: 'CSE',
    academicYear: 'Year II',
    semester: 4,
    description: 'DFA, NFA, Regular expressions, Context-Free Grammars, Pushdown Automata, and Turing Machines.'
  },
  {
    id: 'subj-cse-s4-04',
    name: 'Software Engineering & Agile Methodologies',
    code: 'CS208',
    branch: 'CSE',
    academicYear: 'Year II',
    semester: 4,
    description: 'SDLC models, Agile/Scrum, Requirement engineering, UML modeling, Software testing, and CI/CD.'
  },

  // --- YEAR III ---
  // Semester 5
  {
    id: 'subj-cse-s5-01',
    name: 'Computer Networks',
    code: 'CS301',
    branch: 'CSE',
    academicYear: 'Year III',
    semester: 5,
    description: 'OSI & TCP/IP models, Data link layer, Routing protocols (OSPF, BGP), Congestion control, TCP/UDP, and DNS.'
  },
  {
    id: 'subj-cse-s5-02',
    name: 'Artificial Intelligence & Knowledge Systems',
    code: 'CS302',
    branch: 'CSE',
    academicYear: 'Year III',
    semester: 5,
    description: 'Heuristic search (A*, Minimax), Constraint satisfaction, Knowledge representation, Expert systems, Logic reasoning.'
  },
  {
    id: 'subj-cse-s5-03',
    name: 'Web Technologies & Full-Stack Development',
    code: 'CS303',
    branch: 'CSE',
    academicYear: 'Year III',
    semester: 5,
    description: 'HTML5/CSS3, JavaScript (ES6+), React, Node.js/Express, RESTful APIs, and responsive design.'
  },
  {
    id: 'subj-cse-s5-04',
    name: 'Microprocessors and Microcontrollers',
    code: 'CS304',
    branch: 'CSE',
    academicYear: 'Year III',
    semester: 5,
    description: '8086 architecture, Assembly language programming, 8051 microcontroller, Interfacing devices, Interrupt handling.'
  },

  // Semester 6
  {
    id: 'subj-cse-s6-01',
    name: 'Compiler Design',
    code: 'CS305',
    branch: 'CSE',
    academicYear: 'Year III',
    semester: 6,
    description: 'Lexical analysis, Lex/Flex, LL/LR parsing, Syntax-directed translation, Intermediate code, Code optimization.'
  },
  {
    id: 'subj-cse-s6-02',
    name: 'Machine Learning',
    code: 'CS306',
    branch: 'CSE',
    academicYear: 'Year III',
    semester: 6,
    description: 'Supervised vs unsupervised learning, Linear regression, SVM, Decision trees, Ensemble methods, Clustering, Neural networks.'
  },
  {
    id: 'subj-cse-s6-03',
    name: 'Cryptography and Information Security',
    code: 'CS307',
    branch: 'CSE',
    academicYear: 'Year III',
    semester: 6,
    description: 'Symmetric ciphers (AES/DES), Public key cryptography (RSA, ECC), Hash functions, Digital signatures, Network security.'
  },
  {
    id: 'subj-cse-s6-04',
    name: 'Cloud Computing & Virtualization',
    code: 'CS308',
    branch: 'CSE',
    academicYear: 'Year III',
    semester: 6,
    description: 'IaaS/PaaS/SaaS architectures, Virtualization, Containers (Docker), Kubernetes, Serverless, and AWS/GCP essentials.'
  },

  // --- YEAR IV ---
  // Semester 7
  {
    id: 'subj-cse-s7-01',
    name: 'Deep Learning & Neural Networks',
    code: 'CS401',
    branch: 'CSE',
    academicYear: 'Year IV',
    semester: 7,
    description: 'Backpropagation, Convolutional Neural Networks (CNNs), RNNs/LSTMs, Transformers, GANs, and Transfer Learning.'
  },
  {
    id: 'subj-cse-s7-02',
    name: 'Distributed Systems & Microservices',
    code: 'CS402',
    branch: 'CSE',
    academicYear: 'Year IV',
    semester: 7,
    description: 'RPC, CAP Theorem, Consensus algorithms (Raft/Paxos), Distributed storage, Fault tolerance, and Microservice patterns.'
  },
  {
    id: 'subj-cse-s7-03',
    name: 'Big Data Analytics',
    code: 'CS403',
    branch: 'CSE',
    academicYear: 'Year IV',
    semester: 7,
    description: 'Hadoop ecosystem, MapReduce, Apache Spark, HDFS, NoSQL databases, and real-time streaming analytics.'
  },
  {
    id: 'subj-cse-s7-04',
    name: 'Internet of Things (IoT) & Embedded Systems',
    code: 'CS404',
    branch: 'CSE',
    academicYear: 'Year IV',
    semester: 7,
    description: 'IoT architecture, Sensors/Actuators, MQTT/CoAP protocols, ESP32/Raspberry Pi prototyping, and Cloud IoT platforms.'
  },

  // Semester 8
  {
    id: 'subj-cse-s8-01',
    name: 'Cyber Forensics & Incident Response',
    code: 'CS405',
    branch: 'CSE',
    academicYear: 'Year IV',
    semester: 8,
    description: 'Digital evidence handling, File system forensics, Memory forensics, Network analysis, and Cyber law/ethics.'
  },
  {
    id: 'subj-cse-s8-02',
    name: 'Major Capstone Project',
    code: 'CS406',
    branch: 'CSE',
    academicYear: 'Year IV',
    semester: 8,
    description: 'End-to-end industrial software engineering project, architecture documentation, implementation, and defense.'
  },

  // --- SAMPLE SUBJECTS FOR OTHER BRANCHES (ECE, IT, EEE, ME, CE) ---
  {
    id: 'subj-it-s3-01',
    name: 'Data Structures and Algorithms for IT',
    code: 'IT201',
    branch: 'IT',
    academicYear: 'Year II',
    semester: 3,
    description: 'Linear & Non-linear data structures, searching, sorting and complexity analysis.'
  },
  {
    id: 'subj-ece-s3-01',
    name: 'Analog Electronic Circuits',
    code: 'EC201',
    branch: 'ECE',
    academicYear: 'Year II',
    semester: 3,
    description: 'BJT & MOSFET amplifiers, frequency response, feedback configurations, and oscillators.'
  },
  {
    id: 'subj-ece-s4-01',
    name: 'Signals and Systems',
    code: 'EC202',
    branch: 'ECE',
    academicYear: 'Year II',
    semester: 4,
    description: 'Continuous & discrete time signals, LTI systems, Fourier analysis, and Z-transforms.'
  },
  {
    id: 'subj-eee-s3-01',
    name: 'Electrical Circuit Theory & Network Analysis',
    code: 'EE201',
    branch: 'EEE',
    academicYear: 'Year II',
    semester: 3,
    description: 'Network theorems, transient response, Laplace transforms in circuits, two-port networks.'
  },
  {
    id: 'subj-me-s3-01',
    name: 'Applied Thermodynamics & Heat Transfer',
    code: 'ME201',
    branch: 'ME',
    academicYear: 'Year II',
    semester: 3,
    description: 'First and second laws of thermodynamics, Carnot cycle, gas power cycles, steam tables.'
  },
  {
    id: 'subj-ce-s3-01',
    name: 'Mechanics of Solids & Strength of Materials',
    code: 'CE201',
    branch: 'CE',
    academicYear: 'Year II',
    semester: 3,
    description: 'Stress, strain, shear force & bending moment diagrams, torsion of circular shafts, Mohr circle.'
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-dsa-notes-01',
    title: 'Complete Data Structures & Algorithms Handcrafted Notes',
    description: 'Exhaustive handwritten notes covering Stacks, Queues, Linked Lists, Binary Search Trees, and Heaps with illustrated diagrams, time complexity breakdowns, and C++ code snippets.',
    type: 'notes',
    branch: 'CSE',
    academicYear: 'Year I',
    semester: 2,
    subjectId: 'subj-cse-s2-02',
    subjectName: 'Data Structures and Algorithms Fundamentals',
    externalUrl: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-notes/',
    uploadedBy: 'seed-faculty-01',
    uploaderName: 'Prof. Ananya Sharma',
    tags: ['DSA', 'Trees', 'Notes', 'Semester2', 'ExamPrep'],
    averageRating: 4.9,
    reviewCount: 14,
    fileSize: 4200000,
    fileName: 'DSA_Comprehensive_Notes.pdf',
    createdAt: '2026-09-15T10:30:00.000Z'
  },
  {
    id: 'res-c-prog-qp-01',
    title: 'Previous 5 Years Solved Question Papers: C Programming (2020-2025)',
    description: 'University end-semester examination question papers with detailed step-by-step solution manual, marking scheme analysis, and common programming trap explanations.',
    type: 'question_paper',
    branch: 'CSE',
    academicYear: 'Year I',
    semester: 1,
    subjectId: 'subj-cse-s1-02',
    subjectName: 'Programming for Problem Solving with C',
    externalUrl: 'https://nptel.ac.in/courses/106104128',
    uploadedBy: 'seed-admin-01',
    uploaderName: 'Skill Exchange Academic Archive',
    tags: ['QuestionPaper', 'Solved', 'C-Lang', 'PYQ', 'ExamReady'],
    averageRating: 4.8,
    reviewCount: 22,
    fileSize: 8500000,
    fileName: 'C_Programming_5Yr_Solved_PYQ.pdf',
    createdAt: '2026-09-20T14:15:00.000Z'
  },
  {
    id: 'res-dbms-video-01',
    title: 'Database Management Systems: Full Course Video Lectures',
    description: 'Comprehensive high-yield video lecture playlist covering ER modeling, Relational Algebra, SQL query mastery, Normalization (1NF to BCNF), and ACID transactions.',
    type: 'video',
    branch: 'CSE',
    academicYear: 'Year II',
    semester: 3,
    subjectId: 'subj-cse-s3-04',
    subjectName: 'Database Management Systems (DBMS)',
    externalUrl: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRi_CUQ-FXxgzKQ1dwr_ZJWZ',
    uploadedBy: 'seed-student-02',
    uploaderName: 'Kala Gollapalli',
    tags: ['DBMS', 'SQL', 'Video', 'LectureSeries', 'Database'],
    averageRating: 5.0,
    reviewCount: 19,
    createdAt: '2026-09-28T09:00:00.000Z'
  },
  {
    id: 'res-os-cheatsheet-01',
    title: 'Operating Systems Quick Revision PDF & Formula Sheet',
    description: 'Crisp 15-page revision cheat sheet for CPU Scheduling algorithms, Banker\'s deadlock prevention, Page replacement policies (FIFO, LRU, Optimal), and Disk scheduling.',
    type: 'pdf',
    branch: 'CSE',
    academicYear: 'Year II',
    semester: 4,
    subjectId: 'subj-cse-s4-02',
    subjectName: 'Operating Systems',
    externalUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    uploadedBy: 'seed-student-03',
    uploaderName: 'Dev Patel',
    tags: ['OS', 'CheatSheet', 'Summary', 'PDF', 'QuickRevision'],
    averageRating: 4.7,
    reviewCount: 8,
    fileSize: 2100000,
    fileName: 'OS_Formula_and_Algorithms_Guide.pdf',
    createdAt: '2026-10-02T16:45:00.000Z'
  },
  {
    id: 'res-cn-ref-01',
    title: 'Computer Networks Reference Manual (Tanenbaum & Kurose Summaries)',
    description: 'Synthesized reference notes covering Subnetting, TCP 3-Way Handshake, Sliding Window protocol, OSPF/BGP routing, and Cryptographic protocol mechanisms.',
    type: 'reference',
    branch: 'CSE',
    academicYear: 'Year III',
    semester: 5,
    subjectId: 'subj-cse-s5-01',
    subjectName: 'Computer Networks',
    externalUrl: 'https://gaia.cs.umass.edu/kurose_ross/online_lectures.htm',
    uploadedBy: 'seed-student-02',
    uploaderName: 'Kala Gollapalli',
    tags: ['ComputerNetworks', 'Subnetting', 'Reference', 'YearIII'],
    averageRating: 4.9,
    reviewCount: 11,
    fileSize: 5600000,
    fileName: 'Computer_Networks_Reference_Manual.pdf',
    createdAt: '2026-10-05T11:20:00.000Z'
  },
  {
    id: 'res-ml-lecture-01',
    title: 'Machine Learning & Deep Learning Starter Pack',
    description: 'Hands-on Jupyter notebooks, slide summaries, and video walkthroughs for Gradient Descent, Support Vector Machines, Random Forests, and CNN architectures.',
    type: 'video',
    branch: 'CSE',
    academicYear: 'Year III',
    semester: 6,
    subjectId: 'subj-cse-s6-02',
    subjectName: 'Machine Learning',
    externalUrl: 'https://cs229.stanford.edu/lectures-spring2022.html',
    uploadedBy: 'seed-faculty-02',
    uploaderName: 'Dr. Rajesh Verma',
    tags: ['ML', 'AI', 'DeepLearning', 'Jupyter', 'StanfordCS229'],
    averageRating: 4.9,
    reviewCount: 16,
    createdAt: '2026-10-10T08:15:00.000Z'
  }
];
