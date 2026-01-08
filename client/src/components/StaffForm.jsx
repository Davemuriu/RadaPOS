export default function StaffForm() {
  const submit = async (e) => {
    e.preventDefault();

    await fetch("/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.token}`,
      },
      body: JSON.stringify({
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value,
        role: "CASHIER",
      }),
    });
  };

  return (
    <form onSubmit={submit}>
      <input name="name" placeholder="Cashier Name" />
      <input name="email" placeholder="Email" />
      <input name="password" placeholder="Temporary Password" />
      <button>Create Cashier</button>
    </form>
  );
}
