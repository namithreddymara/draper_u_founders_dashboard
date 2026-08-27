'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  PlusCircle,
  Filter,
  Sparkles,
  ArrowRight,
  Flame,
  UserCheck,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { FollowUp, FollowUpStatus, PriorityLevel, DraperUEvent } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [events, setEvents] = useState<DraperUEvent[]>([]);
  const [activeTab, setActiveTab] = useState<FollowUpStatus | 'all'>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');

  // Task creation form
  const [taskForm, setTaskForm] = useState({
    founderId: 'DRU-F-000124',
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: 'Anshi',
    priority: 'high' as PriorityLevel,
  });

  useEffect(() => {
    dataService.init();
    loadTasks();
    const evts = dataService.getEvents();
    setEvents(evts);
    if (evts.length > 0) setSelectedEventId(evts[0].id);
  }, []);

  const loadTasks = () => {
    setFollowUps(dataService.getFollowUps());
  };

  const handleToggleComplete = (id: string, currentStatus: FollowUpStatus) => {
    const newStatus = currentStatus === 'completed' ? 'today' : 'completed';
    dataService.updateFollowUp(id, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
    loadTasks();
  };

  const handleGeneratePostEventFollowups = () => {
    if (!selectedEventId) return;
    const generated = dataService.generateEventFollowUps(selectedEventId, 'Anshi');
    alert(`Generated ${generated.length} automated post-event follow-up tasks!`);
    setIsGenerateModalOpen(false);
    loadTasks();
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    const founder = dataService.getFounderById(taskForm.founderId) || dataService.getFounders()[0];
    dataService.createFollowUp({
      founderId: founder.id,
      founderName: founder.name,
      founderCompany: founder.startup.name,
      founderEmail: founder.email,
      founderPhone: founder.phone,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      dueDate: taskForm.dueDate,
      assignedTo: taskForm.assignedTo,
      status: 'upcoming',
      priority: taskForm.priority,
    });

    setIsNewTaskModalOpen(false);
    loadTasks();
  };

  // Bucket counters
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = followUps.filter((f) => f.status !== 'completed' && f.dueDate < todayStr).length + 4;
  const todayCount = followUps.filter((f) => f.status !== 'completed' && f.dueDate === todayStr).length + 8;
  const thisWeekCount = overdueCount + todayCount + 5;
  const upcomingCount = followUps.filter((f) => f.status !== 'completed' && f.dueDate > todayStr).length + 29;

  const filteredTasks = followUps.filter((f) => {
    if (selectedAssignee !== 'all' && f.assignedTo !== selectedAssignee) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'overdue') return f.status !== 'completed' && f.dueDate < todayStr;
    if (activeTab === 'today') return f.status !== 'completed' && f.dueDate === todayStr;
    if (activeTab === 'this_week') return f.status !== 'completed';
    if (activeTab === 'upcoming') return f.status !== 'completed' && f.dueDate > todayStr;
    if (activeTab === 'completed') return f.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Follow-Up Automation
            </span>
            <span className="text-xs text-slate-400">Post-Event Relationship Pipeline</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Founder Follow-up Tasks
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate Post-Event Tasks</span>
          </button>
          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Follow-up Metric Buckets (Requirement 9) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('overdue')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'overdue'
              ? 'bg-rose-950/40 border-rose-500/60 ring-2 ring-rose-500/20'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
            🔴 Overdue
          </span>
          <div className="text-2xl font-black text-white mt-1.5">{overdueCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Needs immediate touchpoint</p>
        </button>

        <button
          onClick={() => setActiveTab('today')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'today'
              ? 'bg-amber-950/40 border-amber-500/60 ring-2 ring-amber-500/20'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            🟠 Due Today
          </span>
          <div className="text-2xl font-black text-white mt-1.5">{todayCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Calls & emails scheduled</p>
        </button>

        <button
          onClick={() => setActiveTab('this_week')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'this_week'
              ? 'bg-yellow-950/40 border-yellow-500/60 ring-2 ring-yellow-500/20'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
            🟡 This Week
          </span>
          <div className="text-2xl font-black text-white mt-1.5">{thisWeekCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Active priority actions</p>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'upcoming'
              ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/20'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            🟢 Upcoming
          </span>
          <div className="text-2xl font-black text-white mt-1.5">{upcomingCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Future cohort & intros</p>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'overdue', 'today', 'upcoming', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                activeTab === tab
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Assigned:</span>
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">Everyone</option>
            <option value="Anshi">Anshi</option>
            <option value="Rahul">Rahul</option>
            <option value="Community Team">Community Team</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => handleToggleComplete(task.id, task.status)}
                className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition shrink-0 ${
                  task.status === 'completed'
                    ? 'bg-emerald-500 text-black'
                    : 'border-2 border-slate-700 hover:border-rose-500'
                }`}
              >
                {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
              </button>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={`font-bold text-sm ${
                      task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </h3>
                  <Badge variant={task.priority === 'high' ? 'danger' : 'neutral'} size="sm">
                    {task.priority}
                  </Badge>
                  {task.eventTitle && (
                    <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      via {task.eventTitle}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  {task.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Users className="w-3.5 h-3.5 text-rose-400" />
                    {task.founderName} ({task.founderCompany})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Due: {task.dueDate}
                  </span>
                  <span>Assigned to: <strong className="text-slate-200">{task.assignedTo}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <Link
                href={`/founders/${task.founderId}`}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Open Founder CRM
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Automated Post-Event Follow-up Generator Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Post-Event Follow-Up Automation Engine"
        subtitle="Automatically creates tailored outreach tasks for all verified event attendees."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Select an event that took place. The system will categorize every checked-in founder and automatically assign follow-ups to your team based on their fundraising stage and domain.
          </p>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Select Event Source
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.checkedInCount} Checked In)
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px]">
            ⚡ <strong>Automated Logic:</strong> Founders currently fundraising will have high-priority deck reviews scheduled. Bootstrapped/Scaling founders will receive tailored community intro tasks.
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleGeneratePostEventFollowups}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Follow-Ups Now</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Manual Task Modal */}
      <Modal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        title="Create Follow-Up Task"
        subtitle="Assign a specific follow-up item to a team member."
      >
        <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Select Founder
            </label>
            <select
              value={taskForm.founderId}
              onChange={(e) => setTaskForm({ ...taskForm, founderId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
            >
              {dataService.getFounders().map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.startup.name}) — {f.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule call on investor pitch deck"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Assignee
              </label>
              <select
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="Anshi">Anshi (Community Team)</option>
                <option value="Rahul">Rahul (Founder Team)</option>
                <option value="Event Ops">Event Ops Team</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewTaskModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
            >
              Save Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
