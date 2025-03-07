import React, { useState } from 'react';
import axios from 'axios';

const EditProfile = () => {
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '',
        image: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('lastname', formData.lastname);
        data.append('email', formData.email);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            const response = await axios.put('http://localhost:3000/updateProfile', data, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Profile updated successfully');
            console.log(response.data);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        }
    };

    return (
        <div>
            <h1>Edit Profile</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label>Lastname:</label>
                    <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} required />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                    <label>Profile Image:</label>
                    <input type="file" name="image" onChange={handleFileChange} />
                </div>
                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
};

export default EditProfile;