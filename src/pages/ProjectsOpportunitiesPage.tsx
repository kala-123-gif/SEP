
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  BriefcaseBusiness,
  Users,
  Plus,
  Search,
  ExternalLink,
  FolderKanban,
  CalendarDays,
  LoaderCircle,
  Trash2,
  UserRound,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';

type Project = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  maxTeamSize: number;
  ownerId: string;
  ownerName: string;
  memberIds: string[];
  createdAt: string;
  status?: string;
};

type Opportunity = {
  id: string;
  title: string;
  type: string;
  description: string;
  applicationUrl: string;
  deadline: string;
  ownerId?: string;
  ownerName: string;
};

type JoinRequest = {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
};

export const ProjectsOpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin =
  user?.email?.toLowerCase() ===
  'suryakalagollapalli268@gmail.com';
  const [tab, setTab] = useState<'projects' | 'opportunities'>('projects');
  const [projectView, setProjectView] = useState<'discover' | 'mine'>('discover');
  const [deletingOpportunity, setDeletingOpportunity] =
  useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [teamSize, setTeamSize] = useState('4');
  const [type, setType] = useState('internship');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [deadline, setDeadline] = useState('');

  const [openRequests, setOpenRequests] = useState<Record<string, boolean>>({});
  const [requestsByProject, setRequestsByProject] = useState<
    Record<string, JoinRequest[]>
  >({});
  const [requestsLoading, setRequestsLoading] = useState<
    Record<string, boolean>
  >({});
  const [responding, setResponding] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [projectData, mineData, opportunityData] = await Promise.all([
        api<{ projects: Project[] }>('/api/projects'),
        api<{ projects: Project[] }>('/api/projects/mine'),
        api<{ opportunities: Opportunity[] }>('/api/opportunities'),
      ]);

      setProjects(projectData.projects || []);
      setMyProjects(mineData.projects || []);
      setOpportunities(opportunityData.opportunities || []);
    } catch (e: any) {
      setError(e.message || 'Could not load projects and opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSkills('');
    setTeamSize('4');
    setType('internship');
    setApplicationUrl('');
    setDeadline('');
    setShowForm(false);
  };

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (tab === 'projects') {
        await api('/api/projects', {
          method: 'POST',
          body: JSON.stringify({
            title,
            description,
            skills: skills.split(',').map(s => s.trim()).filter(Boolean),
            maxTeamSize: Number(teamSize),
          }),
        });

        setMessage('Project published successfully!');
        setProjectView('discover');
      } else {
        await api('/api/opportunities', {
          method: 'POST',
          body: JSON.stringify({
            title,
            description,
            type,
            applicationUrl,
            deadline,
          }),
        });

        setMessage('Opportunity published successfully!');
      }

      resetForm();
      await loadData();
    } catch (e: any) {
      setError(e.message || 'Could not publish.');
    } finally {
      setSaving(false);
    }
  };

  const joinProject = async (project: Project) => {
    setError('');
    setMessage('');

    try {
      await api(`/api/projects/${project.id}/join`, { method: 'POST' });
      setMessage(`Join request sent for "${project.title}".`);
    } catch (e: any) {
      setError(e.message || 'Could not send join request.');
    }
  };

  const deleteProject = async (project: Project) => {
    const confirmed = window.confirm(
      `Delete "${project.title}" permanently? This will also remove its join requests.`
    );

    if (!confirmed) return;

    setDeleting(project.id);
    setError('');
    setMessage('');

    try {
      await api(`/api/projects/${project.id}`, { method: 'DELETE' });

      setMyProjects(previous => previous.filter(p => p.id !== project.id));
      setProjects(previous => previous.filter(p => p.id !== project.id));

      setRequestsByProject(previous => {
        const next = { ...previous };
        delete next[project.id];
        return next;
      });

      setMessage(`"${project.title}" was deleted.`);
      await loadData();
    } catch (e: any) {
      setError(e.message || 'Could not delete the project.');
    } finally {
      setDeleting(null);
    }
  };
  
const deleteOpportunity = async (item: Opportunity) => {
  const confirmed = window.confirm(
    `Delete "${item.title}" permanently?`
  );

  if (!confirmed) return;

  setDeletingOpportunity(item.id);
  setError('');
  setMessage('');

  try {
    await api(`/api/opportunities/${item.id}`, {
      method: 'DELETE',
    });

    setOpportunities(previous =>
      previous.filter(opportunity => opportunity.id !== item.id)
    );

    setMessage(`"${item.title}" was deleted.`);
    await loadData();
  } catch (e: any) {
    setError(e.message || 'Could not delete the opportunity.');
  } finally {
    setDeletingOpportunity(null);
  }
};

  const loadJoinRequests = async (projectId: string) => {
    setRequestsLoading(previous => ({ ...previous, [projectId]: true }));
    setError('');

    try {
      const result = await api<{ requests: JoinRequest[] }>(
        `/api/projects/${projectId}/requests`
      );

      setRequestsByProject(previous => ({
        ...previous,
        [projectId]: result.requests || [],
      }));
    } catch (e: any) {
      setError(e.message || 'Could not load join requests.');
    } finally {
      setRequestsLoading(previous => ({ ...previous, [projectId]: false }));
    }
  };

  const toggleJoinRequests = async (projectId: string) => {
    const isOpen = !!openRequests[projectId];

    setOpenRequests(previous => ({
      ...previous,
      [projectId]: !isOpen,
    }));

    if (!isOpen) {
      await loadJoinRequests(projectId);
    }
  };

  const respondToRequest = async (
    project: Project,
    request: JoinRequest,
    status: 'accepted' | 'rejected'
  ) => {
    const actionKey = `${project.id}:${request.id}`;

    setResponding(actionKey);
    setError('');
    setMessage('');

    try {
      await api(
        `/api/projects/${project.id}/requests/${request.id}/respond`,
        {
          method: 'POST',
          body: JSON.stringify({ status }),
        }
      );

      setMessage(
        status === 'accepted'
          ? `${request.userName} was added to "${project.title}".`
          : `Join request from ${request.userName} was rejected.`
      );

      await Promise.all([
        loadJoinRequests(project.id),
        loadData(),
      ]);
    } catch (e: any) {
      setError(e.message || 'Could not update the join request.');
    } finally {
      setResponding(null);
    }
  };

  const filteredProjects = (
    projectView === 'mine' ? myProjects : projects
  ).filter(project => {
    const query = search.toLowerCase();

    return `${project.title} ${project.description} ${(project.skills || []).join(' ')}`
      .toLowerCase()
      .includes(query);
  });

  if (!user) {
    return <div className="p-8">Please sign in to continue.</div>;
  }

const renderProjectCard = (project: Project) => {
  const isOwner = project.ownerId === user.uid;
  const isMember = (project.memberIds || []).includes(user.uid);
  const isRequestsOpen = !!openRequests[project.id];
  const requests = requestsByProject[project.id] || [];
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <article
      key={project.id}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900 break-words">
          {project.title}
        </h3>
        <FolderKanban className="w-5 h-5 text-indigo-600 shrink-0" />
      </div>

      <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">
        {project.description}
      </p>

      {!!project.skills?.length && (
        <div className="flex flex-wrap gap-2 mt-4">
          {project.skills.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="text-xs rounded-full bg-indigo-50 text-indigo-700 px-3 py-1"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
        <Users className="w-4 h-4" />
        {(project.memberIds || []).length}/{project.maxTeamSize} members
      </div>

      <p className="text-xs text-slate-500 mt-2">
        Posted by {project.ownerName}
      </p>

      {/* Only the owner can manage join requests */}
      {isOwner && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-emerald-700">
            Your project
          </p>

          <button
            type="button"
            onClick={() => void toggleJoinRequests(project.id)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 text-indigo-700 py-2.5 font-semibold hover:bg-indigo-50"
          >
            <Users className="w-4 h-4" />
            Manage Join Requests
            {isRequestsOpen && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs">
                {pendingRequests.length} pending
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isRequestsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isRequestsOpen && (
            <div className="rounded-xl bg-slate-50 border p-3 space-y-3">
              {requestsLoading[project.id] ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  Loading requests...
                </div>
              ) : requests.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No join requests yet.
                </p>
              ) : (
                requests.map(request => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg border p-3"
                  >
                    <div className="flex items-start gap-2">
                      <UserRound className="w-4 h-4 mt-1 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-slate-800">
                          {request.userName}
                        </p>
                        <p className="text-xs text-slate-500 capitalize mt-1">
                          Status: {request.status}
                        </p>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          disabled={responding === `${project.id}:${request.id}`}
                          onClick={() =>
                            void respondToRequest(project, request, 'accepted')
                          }
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </button>

                        <button
                          type="button"
                          disabled={responding === `${project.id}:${request.id}`}
                          onClick={() =>
                            void respondToRequest(project, request, 'rejected')
                          }
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-rose-200 text-rose-700 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Owner or admin can delete */}
      {(isOwner || isAdmin) && (
        <button
          type="button"
          disabled={deleting === project.id}
          onClick={() => void deleteProject(project)}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 text-rose-700 py-2.5 font-semibold hover:bg-rose-50 disabled:opacity-50"
        >
          {deleting === project.id ? (
            <LoaderCircle className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          {deleting === project.id ? 'Deleting...' : 'Delete Project'}
        </button>
      )}

      {/* Other students can request to join */}
      {!isOwner && !isAdmin && (
        isMember ? (
          <p className="mt-4 text-sm font-semibold text-emerald-700">
            You are a team member
          </p>
        ) : (
          <button
            type="button"
            onClick={() => void joinProject(project)}
            className="mt-4 w-full rounded-xl bg-indigo-600 text-white py-2.5 font-semibold hover:bg-indigo-700"
          >
            Request to Join
          </button>
        )
      )}
    </article>
  );
};
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-600 text-white p-7 sm:p-10 mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-100">
            Student Hub
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2">
            Projects &amp; Opportunities
          </h1>
          <p className="mt-3 max-w-2xl text-indigo-100">
            Discover projects, find teammates, and explore internships, jobs,
            hackathons, and competitions.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <FolderKanban className="inline w-5 h-5 mr-2" />
              {projects.length} Open Projects
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <FolderKanban className="inline w-5 h-5 mr-2" />
              {myProjects.length} My Projects
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <BriefcaseBusiness className="inline w-5 h-5 mr-2" />
              {opportunities.length} Opportunities
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            {message}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setTab('projects');
                setShowForm(false);
                setError('');
              }}
              className={`px-4 py-2.5 rounded-xl font-semibold ${
                tab === 'projects'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border'
              }`}
            >
              Projects
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('opportunities');
                setShowForm(false);
                setError('');
              }}
              className={`px-4 py-2.5 rounded-xl font-semibold ${
                tab === 'opportunities'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border'
              }`}
            >
              Opportunities
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setError('');
              setMessage('');
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 font-semibold"
          >
            <Plus className="w-4 h-4" />
            {tab === 'projects' ? 'Publish Project' : 'Post Opportunity'}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={publish}
            className="mb-8 bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 space-y-4 shadow-sm"
          >
            <h2 className="text-xl font-bold">
              {tab === 'projects'
                ? 'Publish a Student Project'
                : 'Post an Opportunity'}
            </h2>

            <label className="block text-sm font-medium">
              Title
              <input
                required
                maxLength={tab === 'projects' ? 120 : 150}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-lg border p-3"
                placeholder="Enter a title"
              />
            </label>

            <label className="block text-sm font-medium">
              Description
              <textarea
                required
                maxLength={3000}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-lg border p-3 min-h-28"
                placeholder="Describe the project or opportunity"
              />
            </label>

            {tab === 'projects' ? (
              <>
                <label className="block text-sm font-medium">
                  Required skills (comma-separated)
                  <input
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    className="mt-1 block w-full rounded-lg border p-3"
                    placeholder="React, Python, UI/UX"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Maximum team size (including you)
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={teamSize}
                    onChange={e => setTeamSize(e.target.value)}
                    className="mt-1 block w-full rounded-lg border p-3"
                  />
                </label>
              </>
            ) : (
              <>
                <label className="block text-sm font-medium">
                  Type
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="mt-1 block w-full rounded-lg border p-3"
                  >
                    <option value="internship">Internship</option>
                    <option value="job">Job</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="competition">Competition</option>
                  </select>
                </label>

                <label className="block text-sm font-medium">
                  Application link
                  <input
                    type="url"
                    required
                    value={applicationUrl}
                    onChange={e => setApplicationUrl(e.target.value)}
                    className="mt-1 block w-full rounded-lg border p-3"
                    placeholder="https://..."
                  />
                </label>

                <label className="block text-sm font-medium">
                  Deadline
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="mt-1 block w-full rounded-lg border p-3"
                  />
                </label>
              </>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 text-white px-5 py-3 font-semibold disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border px-5 py-3 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {tab === 'projects' && (
          <>
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                type="button"
                onClick={() => setProjectView('discover')}
                className={`rounded-xl px-4 py-2 font-semibold ${
                  projectView === 'discover'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-white border text-slate-700'
                }`}
              >
                Discover Projects
              </button>

              <button
                type="button"
                onClick={() => setProjectView('mine')}
                className={`rounded-xl px-4 py-2 font-semibold ${
                  projectView === 'mine'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-white border text-slate-700'
                }`}
              >
                My Projects ({myProjects.length})
              </button>
            </div>

            <div className="mb-5 relative max-w-xl">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border bg-white py-3 pl-10 pr-4"
                placeholder="Search projects or required skills..."
              />
            </div>
          </>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-12 justify-center text-slate-500">
            <LoaderCircle className="animate-spin" />
            Loading...
          </div>
        ) : tab === 'projects' ? (
          filteredProjects.length ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProjects.map(renderProjectCard)}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border p-10 text-center text-slate-500">
              {projectView === 'mine'
                ? "You haven't created or joined any projects yet."
                : 'No projects found. Publish the first one!'}
            </div>
          )
        ) : opportunities.length ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {opportunities.map(item => (
              <article
                key={item.id}
                className="bg-white border rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <BriefcaseBusiness className="w-5 h-5 text-violet-600 shrink-0" />
                </div>

                <span className="inline-block mt-3 rounded-full bg-violet-50 text-violet-700 px-3 py-1 text-xs font-semibold capitalize">
                  {item.type}
                </span>

                <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">
                  {item.description}
                </p>

                {item.deadline && (
                  <p className="text-sm text-slate-500 mt-3">
                    <CalendarDays className="inline w-4 h-4 mr-1" />
                    Deadline: {item.deadline}
                  </p>
                )}

                <p className="text-xs text-slate-500 mt-2">
                  Posted by {item.ownerName}
                </p>

                <a
                  href={item.applicationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white px-4 py-2.5 font-semibold"
                >
                  Apply
                  <ExternalLink className="w-4 h-4" />
                </a>
                
{(item.ownerId === user.uid || isAdmin) && (
  <button
    type="button"
    onClick={() => deleteOpportunity(item)}
    disabled={deletingOpportunity === item.id}
    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
  >
    <Trash2 className="h-4 w-4" />
    {deletingOpportunity === item.id
      ? 'Deleting...'
      : 'Delete Opportunity'}
  </button>
)}

              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-10 text-center text-slate-500">
            No opportunities yet. Post the first one!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsOpportunitiesPage;
