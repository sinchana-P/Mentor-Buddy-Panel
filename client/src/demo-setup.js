// Demo setup - run this to set up local storage for demo mode
const demoUser = {
  "email": "demo@mentorpanel.com",
  "name": "Demo Manager", 
  "role": "manager",
  "domainRole": "frontend",
  "id": "demo-user-id",
  "avatarUrl": null,
  "createdAt": new Date().toISOString(),
  "updatedAt": new Date().toISOString()
};

localStorage.setItem('user_profile', JSON.stringify(demoUser));
console.log('Demo user profile set:', demoUser);
window.location.reload();