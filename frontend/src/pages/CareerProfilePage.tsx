import { useEffect, useState, type FormEvent } from 'react'
import {
  UserRound,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

import {
  getUserProfile,
  saveUserProfile,
} from '../services/profileService'

import type { UserProfileRequest } from '../types/profile'

function CareerProfilePage() {
  const [professionalSummary, setProfessionalSummary] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [technicalSkills, setTechnicalSkills] = useState('')
  const [targetRoles, setTargetRoles] = useState('')
  const [preferredDifficulty, setPreferredDifficulty] =
    useState<UserProfileRequest['preferred_difficulty']>('Intermediate')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile()

        if (profile) {
          setProfessionalSummary(profile.professional_summary || '')
          setYearsOfExperience(
            profile.years_of_experience?.toString() || '',
          )
          setTechnicalSkills(profile.technical_skills.join(', '))
          setTargetRoles(profile.target_roles.join(', '))
          setPreferredDifficulty(profile.preferred_difficulty)
        }
      } catch {
        setError('Unable to load your career profile.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccessMessage('')

      const profileData: UserProfileRequest = {
        professional_summary: professionalSummary.trim() || null,
        years_of_experience:
          yearsOfExperience.trim() === ''
            ? null
            : Number(yearsOfExperience),
        technical_skills: technicalSkills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        target_roles: targetRoles
          .split(',')
          .map((role) => role.trim())
          .filter(Boolean),
        preferred_difficulty: preferredDifficulty,
      }

      await saveUserProfile(profileData)

      setSuccessMessage('Career profile saved successfully.')
    } catch {
      setError('Unable to save your career profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={28} />
        <p className="ml-3 text-gray-500">Loading your career profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Career Profile
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your professional information to personalize your AI
          interview preparation experience.
        </p>
      </div>

      {/* Profile Form */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-3">
            <UserRound className="text-purple-600" size={23} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Professional Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Tell us about your experience, skills, and career goals.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Professional Summary */}
          <div>
            <label
              htmlFor="professional-summary"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Professional Summary
            </label>

            <textarea
              id="professional-summary"
              value={professionalSummary}
              onChange={(event) =>
                setProfessionalSummary(event.target.value)
              }
              placeholder="Briefly describe your professional background and experience..."
              rows={4}
              maxLength={2000}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {professionalSummary.length}/2000
            </p>
          </div>

          {/* Years of Experience */}
          <div>
            <label
              htmlFor="experience"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Years of Experience
            </label>

            <input
              id="experience"
              type="number"
              min="0"
              max="50"
              step="0.5"
              value={yearsOfExperience}
              onChange={(event) =>
                setYearsOfExperience(event.target.value)
              }
              placeholder="Example: 2.5"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          {/* Technical Skills */}
          <div>
            <label
              htmlFor="technical-skills"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Technical Skills
            </label>

            <input
              id="technical-skills"
              type="text"
              value={technicalSkills}
              onChange={(event) =>
                setTechnicalSkills(event.target.value)
              }
              placeholder="Python, FastAPI, React, PostgreSQL"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />

            <p className="mt-1 text-xs text-gray-400">
              Separate each skill with a comma.
            </p>
          </div>

          {/* Target Roles */}
          <div>
            <label
              htmlFor="target-roles"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Target Roles
            </label>

            <input
              id="target-roles"
              type="text"
              value={targetRoles}
              onChange={(event) =>
                setTargetRoles(event.target.value)
              }
              placeholder="Python Developer, Full Stack Developer, AI Developer"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />

            <p className="mt-1 text-xs text-gray-400">
              Separate each target role with a comma.
            </p>
          </div>

          {/* Preferred Difficulty */}
          <div>
            <label
              htmlFor="preferred-difficulty"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Preferred Interview Difficulty
            </label>

            <select
              id="preferred-difficulty"
              value={preferredDifficulty}
              onChange={(event) =>
                setPreferredDifficulty(
                  event.target.value as UserProfileRequest['preferred_difficulty'],
                )
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="flex justify-end border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CareerProfilePage
