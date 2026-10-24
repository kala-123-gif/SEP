import React, { useState } from 'react';
function WeeklyPlanner() {
    const [tasks, setTasks] = React.useState<
        { id: number; title: string; day: string; done: boolean }[]
    >(() => {
        try {
            return JSON.parse(localStorage.getItem("weeklyLearningTasks") || "[]");
        } catch {
            return [];
        }
    });

    const [title, setTitle] = React.useState("");
    const [day, setDay] = React.useState("Monday");

    function saveTasks(updated: typeof tasks) {
        setTasks(updated);
        localStorage.setItem("weeklyLearningTasks", JSON.stringify(updated));
    }

    function addTask() {
        if (!title.trim()) return;

        saveTasks([
            ...tasks,
            {
                id: Date.now(),
                title: title.trim(),
                day,
                done: false,
            },
        ]);
        setTitle("");
    }

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    const completedCount = tasks.filter((task) => task.done).length;
    const progressPercentage =
        tasks.length === 0
            ? 0
            : Math.round((completedCount / tasks.length) * 100);

    return (
        <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") addTask();
                    }}
                    placeholder="Enter a study task..."
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
                />

                <select
                    value={day}
                    onChange={(event) => setDay(event.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                >
                    {days.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    onClick={addTask}
                    className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
                >
                    Add Task
                </button>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-600">
                        Progress: {completedCount} of {tasks.length} tasks completed
                    </p>
                    <span className="text-sm font-bold text-indigo-600">
                        {progressPercentage}%
                    </span>
                </div>

                <div
                    className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label="Weekly learning progress"
                    aria-valuenow={progressPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {tasks.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    No tasks yet. Add your first study task above!
                </p>
            ) : (
                <div className="space-y-2">
                    {days.map((currentDay) => {
                        const dayTasks = tasks.filter(
                            (task) => task.day === currentDay
                        );

                        if (dayTasks.length === 0) return null;

                        return (
                            <div key={currentDay} className="rounded-lg border border-slate-200 p-3">
                                <h3 className="mb-2 font-semibold text-slate-800">
                                    {currentDay}
                                </h3>

                                {dayTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-3 border-t border-slate-100 py-2"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={task.done}
                                            onChange={(event) => {
                                                saveTasks(
                                                    tasks.map((item) =>
                                                        item.id === task.id
                                                            ? { ...item, done: event.target.checked }
                                                            : item
                                                    )
                                                );
                                            }}
                                            className="h-4 w-4 accent-indigo-600"
                                        />

                                        <span
                                            className={
                                                task.done
                                                    ? "flex-1 text-sm text-slate-400 line-through"
                                                    : "flex-1 text-sm text-slate-700"
                                            }
                                        >
                                            {task.title}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                saveTasks(tasks.filter((item) => item.id !== task.id))
                                            }
                                            className="text-sm font-medium text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
const roadmaps = [
    {
        title: 'Software Developer',
        icon: '💻',
        description: 'Build applications, websites, and software systems.',
        skills: ['C / C++', 'Java or Python', 'Data Structures & Algorithms', 'Git and GitHub', 'SQL'],
        steps: [
            'Learn programming fundamentals',
            'Practice Data Structures and Algorithms',
            'Build two or three projects',
            'Learn Git, databases, and APIs',
            'Prepare for internships and coding interviews',
        ],
    },
    {
        title: 'Web Developer',
        icon: '🌐',
        description: 'Create modern, responsive websites and web applications.',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
        steps: [
            'Learn HTML and CSS',
            'Practice JavaScript',
            'Build responsive webpages',
            'Learn React and backend basics',
            'Create and deploy a full-stack project',
        ],
    },
    {
        title: 'Data Scientist',
        icon: '📊',
        description: 'Use data, statistics, and machine learning to solve problems.',
        skills: ['Python', 'SQL', 'Statistics', 'Pandas', 'Machine Learning'],
        steps: [
            'Learn Python programming',
            'Study statistics and probability',
            'Practice data analysis with Pandas',
            'Learn machine learning fundamentals',
            'Build data analysis and prediction projects',
        ],
    },
    {
        title: 'Cybersecurity Engineer',
        icon: '🔐',
        description: 'Help protect systems, networks, and applications.',
        skills: ['Networking', 'Linux', 'Python', 'Web Security', 'Security Fundamentals'],
        steps: [
            'Learn computer networks',
            'Understand Linux and operating systems',
            'Learn programming and scripting',
            'Study security concepts in legal practice labs',
            'Build security projects and document your learning',
        ],
    },
];

export function CareerDevelopmentPage() {
    const [gateBranch, setGateBranch] = useState(
        () => localStorage.getItem("gateBranch") || "CSE"
    );

    const [completedSubjects, setCompletedSubjects] = useState<string[]>(
        () => JSON.parse(localStorage.getItem("gateCompletedSubjects") || "[]")
    );
    const [showGateSubjects, setShowGateSubjects] = useState(true);
    const [selected, setSelected] = useState<(typeof roadmaps)[number] | null>(null);
    const [completed, setCompleted] = useState<string[]>(
        () => JSON.parse(localStorage.getItem("careerCompletedSteps") || "[]")
    );
    const gateSubjects: Record<string, string[]> = {
        CSE: [
            "Engineering Mathematics", "Digital Logic", "Computer Organization",
            "Programming and Data Structures", "Algorithms", "Operating Systems",
            "Database Management Systems", "Computer Networks",
            "Theory of Computation", "Compiler Design",
        ],
        ECE: [
            "Engineering Mathematics", "Networks", "Signals and Systems",
            "Electronic Devices", "Analog Circuits", "Digital Circuits",
            "Control Systems", "Communications", "Electromagnetics",
        ],
        DA: [
            "Probability and Statistics", "Linear Algebra",
            "Calculus and Optimization", "Programming and Data Structures",
            "Database Management", "Machine Learning", "Artificial Intelligence",
        ],
        ME: [
            "Engineering Mathematics", "Engineering Mechanics",
            "Mechanics of Materials", "Theory of Machines", "Thermodynamics",
            "Fluid Mechanics", "Manufacturing Engineering",
        ],
        CE: [
            "Engineering Mathematics", "Structural Engineering",
            "Geotechnical Engineering", "Water Resources Engineering",
            "Environmental Engineering", "Transportation Engineering", "Surveying",
        ],
    };
    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-6xl">
                <p className="mb-2 text-sm font-semibold text-indigo-600">
                    STUDENT CAREER HUB
                </p>
                <h1 className="text-3xl font-bold text-slate-900">
                    Career Development & GATE Preparation
                </h1>
                <p className="mt-3 text-slate-600">
                    Explore career paths, learn essential skills, and plan your future.
                </p>

                <h2 className="mt-8 mb-4 text-2xl font-bold text-slate-900">
                    Career Roadmaps
                </h2>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {roadmaps.map((roadmap) => (
                        <button
                            key={roadmap.title}
                            onClick={() => setSelected(roadmap)}
                            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-md ${selected?.title === roadmap.title
                                ? 'border-indigo-500 ring-2 ring-indigo-100'
                                : 'border-slate-200'
                                }`}
                        >
                            <span className="text-3xl">{roadmap.icon}</span>
                            <h3 className="mt-3 font-bold text-slate-900">{roadmap.title}</h3>
                            <p className="mt-2 text-sm text-slate-600">{roadmap.description}</p>
                            <span className="mt-4 inline-block text-sm font-semibold text-indigo-600">
                                View roadmap →
                            </span>
                        </button>
                    ))}
                </div>

                {selected && (
                    <section className="mt-6 rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {selected.icon} {selected.title} Roadmap
                            </h2>
                            <button
                                onClick={() => setSelected(null)}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                            >
                                Close
                            </button>
                        </div>

                        <h3 className="mt-6 font-bold text-slate-800">Skills to learn</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {selected.skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="rounded-full bg-indigo-50 px-3 py-2 text-sm text-indigo-700"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>

                        <h3 className="mt-6 font-bold text-slate-800">Your learning steps</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Tick each step as you complete it.
                        </p>

                        <div className="mt-3 space-y-3">
                            {selected.steps.map((step, index) => {
                                const key = `${selected.title}:${step}`;
                                const isDone = completed.includes(key);

                                return (
                                    <label
                                        key={step}
                                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isDone}
                                            onChange={(event) => {
                                                const updated = event.target.checked
                                                    ? [...completed, key].filter(
                                                        (item, index, array) => array.indexOf(item) === index
                                                    )
                                                    : completed.filter((item) => item !== key);

                                                setCompleted(updated);
                                                localStorage.setItem("careerCompletedSteps", JSON.stringify(updated));
                                            }}
                                            className="mt-1 h-4 w-4 accent-indigo-600"
                                        />
                                        <span className={isDone ? 'text-slate-400 line-through' : 'text-slate-700'}>
                                            <strong>{index + 1}.</strong> {step}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        <p className="mt-4 font-semibold text-indigo-700">
                            Progress: {selected.steps.filter((step) =>
                                completed.includes(`${selected.title}:${step}`)
                            ).length} / {selected.steps.length} steps completed
                        </p>
                    </section>
                )}

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <section className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setShowGateSubjects((previous) => !previous)}
                            className="absolute right-4 top-4 rounded-lg px-3 py-1 text-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            aria-label={showGateSubjects ? "Hide GATE subjects" : "Show GATE subjects"}
                            title={showGateSubjects ? "Hide subjects" : "Show subjects"}
                        >
                            {showGateSubjects ? "×" : "+"}
                        </button>
                        <div className="mb-3 text-3xl">📚</div>
                        <h2 className="text-xl font-bold text-slate-900">
                            GATE Preparation
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Choose your GATE branch and explore its core subjects.
                        </p>

                        <label
                            htmlFor="gate-branch"
                            className="mt-4 block text-sm font-semibold text-slate-700"
                        >
                            Select your branch
                        </label>

                        <select
                            id="gate-branch"
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
                            value={gateBranch}
                            onChange={(event) => {
                                const branch = event.target.value;
                                setGateBranch(branch);
                                localStorage.setItem("gateBranch", branch);
                            }}
                        >
                            <option value="CSE">GATE CSE</option>
                            <option value="ECE">GATE ECE</option>
                            <option value="DA">GATE Data Science & AI</option>
                            <option value="ME">GATE Mechanical Engineering</option>
                            <option value="CE">GATE Civil Engineering</option>
                        </select>

                        {showGateSubjects && (
                            <div className="mt-4 space-y-2">
                                {(gateSubjects[gateBranch] ?? []).map((subject) => (
                                    <label
                                        key={`${gateBranch}-${subject}`}
                                        className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={completedSubjects.includes(`${gateBranch}:${subject}`)}
                                            onChange={(event) => {
                                                const key = `${gateBranch}:${subject}`;

                                                const updated = event.target.checked
                                                    ? [...completedSubjects, key].filter(
                                                        (item, index, array) => array.indexOf(item) === index
                                                    )
                                                    : completedSubjects.filter((item) => item !== key);

                                                setCompletedSubjects(updated);
                                                localStorage.setItem(
                                                    "gateCompletedSubjects",
                                                    JSON.stringify(updated)
                                                );
                                            }}
                                            className="h-4 w-4 accent-indigo-600"
                                        />
                                        {subject}
                                    </label>
                                ))}
                            </div>
                        )}


                        <p className="mt-4 text-xs text-slate-500">
                            Tick subjects as you complete your preparation.
                        </p>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <span className="text-3xl">📅</span>
                        <h2 className="mt-3 text-xl font-bold text-slate-900">
                            Weekly Learning Planner
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Plan your study tasks and track your weekly progress.
                        </p>

                        <WeeklyPlanner />
                    </section>
                </div>
            </div>
        </div>
    );
}
