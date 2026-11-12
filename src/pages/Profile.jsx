
import { apartments, formatRange, leaseSummary } from '../data/apartments.js'

function ProfileSection({ title, children }) {
  return (
    <section className="profile-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Profile({ user, savedApartmentIds = [], postedSubleases = [] }) {
  const savedApartments = apartments.filter((apartment) =>
    savedApartmentIds.includes(apartment.id)
  )

  return (
    <main className="profile">
      <header className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account and apartment activity.</p>
      </header>

      {/* Personal Information */}
      <ProfileSection title="Personal Information">
        <p><strong>Name:</strong> {user?.name ?? 'Not provided'}</p>
        <p><strong>Email:</strong> {user?.email ?? 'Not provided'}</p>
        <p><strong>Phone:</strong> {user?.phone ?? 'Not provided'}</p>
        <button type="button">Edit Profile</button>
      </ProfileSection>

      {/* Apartment Preferences */}
      <ProfileSection title="Apartment Preferences">
        <p><strong>Preferred Location:</strong> {user?.preferences?.location ?? 'Not specified'}</p>
        <p><strong>Monthly Budget:</strong> {user?.preferences?.budget ?? 'Not specified'}</p>
        <p><strong>Bedrooms:</strong> {user?.preferences?.bedrooms ?? 'Not specified'}</p>
        <p><strong>Move-in Date:</strong> {user?.preferences?.moveInDate ?? 'Not specified'}</p>
        <button type="button">Edit Preferences</button>
      </ProfileSection>

      {/* Saved Apartments */}
      <ProfileSection title="Saved Apartments">
        {savedApartments.length === 0 ? (
          <p>You haven't saved any apartments yet.</p>
        ) : (
          <ul className="profile-apartment-list">
            {savedApartments.map((apartment) => {
              const summary = leaseSummary(apartment)

              return (
                <li key={apartment.id}>
                  <h3>{apartment.name}</h3>
                  <p>{apartment.address}</p>
                  <p>{summary.count} available options</p>
                  <p>{formatRange(summary)} /mo</p>
                </li>
              )
            })}
          </ul>
        )}
      </ProfileSection>

      {/* Posted Subleases */}
      <ProfileSection title="My Posted Subleases">
        {postedSubleases.length === 0 ? (
          <p>You haven't posted any subleases yet.</p>
        ) : (
          <ul>
            {postedSubleases.map((sublease) => (
              <li key={sublease.id}>
                <h3>{sublease.title}</h3>
                <p>{sublease.address}</p>
                <p>Status: {sublease.status}</p>
              </li>
            ))}
          </ul>
        )}
      </ProfileSection>
    </main>
  )
}

export default Profile
