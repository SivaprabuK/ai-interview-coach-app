import { useEffect, useState } from 'react'
import { getAccountDetails, updateAccount } from '../services/authService'
import { User, Lock, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '../services/authService'
import { getUserProfile, saveUserProfile } from '../services/profileService'
import type { UserProfile } from '../types/profile'

function SettingsPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const [difficulty, setDifficulty] = useState<
        'Beginner' | 'Intermediate' | 'Advanced'
    >('Intermediate')

    const [questionCount, setQuestionCount] = useState(10)
    const [preferencesSaving, setPreferencesSaving] = useState(false)
    const [preferencesMessage, setPreferencesMessage] = useState('')
    const [preferencesError, setPreferencesError] = useState('')
    const [profile, setProfile] = useState<UserProfile | null>(null)

    useEffect(() => {
    const loadAccount = async () => {
        try {
        const account = await getAccountDetails()
        setName(account.name)
        setEmail(account.email)
        } catch {
        setError('Failed to load account details.')
        } finally {
        setLoading(false)
        }
    }

    loadAccount()
    }, [])

    useEffect(() => {
    const loadPreferences = async () => {
        try {
        const userProfile = await getUserProfile()

        if (userProfile) {
            setProfile(userProfile)
            setDifficulty(userProfile.preferred_difficulty)
            setQuestionCount(userProfile.preferred_question_count)
        }
        } catch {
        setPreferencesError('Failed to load interview preferences.')
        }
    }

    loadPreferences()
    }, [])

    const handlePreferencesSave = async () => {
        try {
            setPreferencesSaving(true)
            setPreferencesError('')
            setPreferencesMessage('')

            await saveUserProfile({
            professional_summary: profile?.professional_summary ?? null,
            years_of_experience: profile?.years_of_experience ?? null,
            technical_skills: profile?.technical_skills ?? [],
            target_roles: profile?.target_roles ?? [],
            preferred_difficulty: difficulty,
            preferred_question_count: questionCount,
            })

            setPreferencesMessage('Interview preferences saved successfully.')
        } catch (err: unknown) {
            const error = err as {
            response?: { data?: { detail?: string } }
            }

            setPreferencesError(
            error.response?.data?.detail ||
                'Failed to save interview preferences.',
            )
        } finally {
            setPreferencesSaving(false)
        }
    }

    const handleAccountSave = async () => {
        if (!name.trim() || !email.trim()) {
            setError('Name and email are required.')
            return
        }

        try {
            setSaving(true)
            setError('')
            setMessage('')

            const updatedAccount = await updateAccount({
            name: name.trim(),
            email: email.trim(),
            })

            setName(updatedAccount.name)
            setEmail(updatedAccount.email)
            setMessage('Account details updated successfully.')
        } catch (err: any) {
            setError(
            err.response?.data?.detail || 'Failed to update account details.',
            )
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError('All password fields are required.')
        return
    }

    if (newPassword.length < 8) {
        setPasswordError('New password must contain at least 8 characters.')
        return
    }

    if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match.')
        return
    }

    try {
        setPasswordSaving(true)
        setPasswordError('')
        setPasswordMessage('')

        await changePassword(currentPassword, newPassword)

        setPasswordMessage('Password changed successfully. Redirecting to login...')

        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        setTimeout(() => {
        navigate('/login', { replace: true })
        }, 1500)
    } catch (err: unknown) {
        const error = err as {
        response?: { data?: { detail?: string } }
        }

        setPasswordError(
        error.response?.data?.detail || 'Failed to change password.',
        )
    } finally {
        setPasswordSaving(false)
    }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
            <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
                Settings
            </h1>
            <p className="mt-2 text-sm text-gray-500">
                Manage your account, security, and interview preferences.
            </p>
            </div>

            {/* Account Settings */}
            <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                <User size={21} />
                </div>
                <div>
                <h2 className="text-lg font-semibold text-gray-900">
                    Account Settings
                </h2>
                <p className="text-sm text-gray-500">
                    Update your personal information.
                </p>
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your name"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email Address
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
                </div>
            </div>

            {message && (
                <p className="mt-4 text-sm text-green-600">{message}</p>
                )}

                {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
                )
            }

            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={handleAccountSave}
                    disabled={saving || loading}
                    className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            </section>

            
            {/* Security Settings */}
            <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                <Lock size={21} />
                </div>
                <div>
                <h2 className="text-lg font-semibold text-gray-900">
                    Security
                </h2>
                <p className="text-sm text-gray-500">
                    Change your account password.
                </p>
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Current Password
                </label>
                <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    New Password
                </label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Confirm New Password
                </label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
                </div>
            </div>

            {passwordMessage && (
                <p className="mt-4 text-sm text-green-600">{passwordMessage}</p>
            )}

            {passwordError && (
                <p className="mt-4 text-sm text-red-600">{passwordError}</p>
            )}

            <div className="mt-6 flex justify-end">
                <button
                type="button"
                onClick={handlePasswordChange}
                disabled={passwordSaving}
                className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                {passwordSaving ? 'Updating...' : 'Change Password'}
                </button>
            </div>
            </section>
            
            {/* Interview Preferences */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                <SlidersHorizontal size={21} />
                </div>
                <div>
                <h2 className="text-lg font-semibold text-gray-900">
                    Interview Preferences
                </h2>
                <p className="text-sm text-gray-500">
                    Customize your interview practice experience.
                </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Default Difficulty
                </label>
                <select
                    value={difficulty}
                    onChange={(event) =>
                    setDifficulty(
                        event.target.value as 'Beginner' | 'Intermediate' | 'Advanced',
                    )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Number of Questions
                </label>
                <select
                    value={questionCount}
                    onChange={(event) => setQuestionCount(Number(event.target.value))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                </select>
                </div>
            </div>

            {preferencesMessage && (
                <p className="mt-4 text-sm text-green-600">
                {preferencesMessage}
                </p>
            )}

            {preferencesError && (
                <p className="mt-4 text-sm text-red-600">
                {preferencesError}
                </p>
            )}

            <div className="mt-6 flex justify-end">
                <button
                type="button"
                onClick={handlePreferencesSave}
                disabled={preferencesSaving}
                className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                {preferencesSaving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
            </section>

        </div>
        </div>
    )
}

export default SettingsPage
