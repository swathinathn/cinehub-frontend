import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import "./profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: "", phone: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/users/profile/");
      setProfile(res.data);
      setFormData({ username: res.data.username, phone: res.data.phone || "" });
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const err = {};
    if (!formData.username.trim()) {
      err.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      err.username = "Username must be at least 3 characters";
    }

    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      err.phone = "Enter a valid 10-digit phone number";
    }

    return err;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      setSaving(true);
      const data = new FormData();
      data.append("username", formData.username);
      data.append("phone", formData.phone);
      if (photoFile) data.append("profile_photo", photoFile);

      const res = await API.put("/users/profile/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile(res.data);
      setEditMode(false);
      setMessage("✅ Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);

      const localUser = JSON.parse(localStorage.getItem("cinehub-user"));
      localStorage.setItem("cinehub-user", JSON.stringify({
        ...localUser,
        name: res.data.username,
      }));
    } catch (err) {
      setMessage("❌ Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ color: "#fff", textAlign: "center", marginTop: "100px" }}>
      Loading profile...
    </div>
  );

  if (!profile) return (
    <div style={{ color: "#fff", textAlign: "center", marginTop: "100px" }}>
      Please login to view your profile.
    </div>
  );

  const photoUrl = photoPreview
    ? photoPreview
    : profile.profile_photo
      ? (profile.profile_photo.startsWith("http") ? profile.profile_photo : `${BACKEND_URL}$${profile.profile_photo}`)
      : null;

  return (
    <div className="profile-page">
      <div className="profile-card">

        <div className="profile-header">
          <div className="profile-photo-wrapper">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="profile-photo-img" />
            ) : (
              <div className="profile-photo-placeholder">
                {profile.username?.[0]?.toUpperCase()}
              </div>
            )}
            {editMode && (
              <label className="photo-upload-btn">
                📷
                <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
              </label>
            )}
          </div>

          <div className="profile-header-info">
            <h2>{profile.username}</h2>
            <p>{profile.email}</p>
            <span className={`role-badge ${profile.role}`}>
              {profile.role === "admin" ? "👑 Admin" : "👤 User"}
            </span>
          </div>
        </div>

        {message && <div className="profile-message">{message}</div>}

        <div className="profile-fields">
          <div className="profile-field">
            <label>Username</label>
            {editMode ? (
              <>
                <input
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    setErrors({ ...errors, username: null });
                  }}
                />
                {errors.username && (
                  <span style={{ color: "#f84464", fontSize: "12px", marginTop: "4px", display: "block" }}>
                    {errors.username}
                  </span>
                )}
              </>
            ) : (
              <p>{profile.username}</p>
            )}
          </div>

          <div className="profile-field">
            <label>Email</label>
            <p>{profile.email} <span className="locked-tag">🔒 cannot be changed</span></p>
          </div>

          <div className="profile-field">
            <label>Phone</label>
            {editMode ? (
              <>
                <input
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) });
                    setErrors({ ...errors, phone: null });
                  }}
                  placeholder="Add phone number"
                />
                {errors.phone && (
                  <span style={{ color: "#f84464", fontSize: "12px", marginTop: "4px", display: "block" }}>
                    {errors.phone}
                  </span>
                )}
              </>
            ) : (
              <p>{profile.phone || "Not added"}</p>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {editMode ? (
            <>
              <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button className="profile-cancel-btn" onClick={() => {
                setEditMode(false);
                setFormData({ username: profile.username, phone: profile.phone || "" });
                setPhotoPreview(null);
                setPhotoFile(null);
                setErrors({});
              }}>
                Cancel
              </button>
            </>
          ) : (
            <button className="profile-edit-btn" onClick={() => setEditMode(true)}>
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}