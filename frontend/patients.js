const e = React.createElement;

function PatientsPage() {
  const [patients, setPatients] = React.useState([]);
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');

  const load = () => {
    fetch('http://localhost:8000/api/patients')
      .then(res => res.json())
      .then(setPatients);
  };

  React.useEffect(load, []);

  const addPatient = () => {
    fetch('http://localhost:8000/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone })
    }).then(() => { setName(''); setPhone(''); load(); });
  };

  const deletePatient = id => {
    fetch(`http://localhost:8000/api/patients/${id}`, { method: 'DELETE' })
      .then(load);
  };

  const editPatient = p => {
    const newName = prompt('Name', p.name);
    const newPhone = prompt('Phone', p.phone || '');
    if (newName !== null) {
      fetch(`http://localhost:8000/api/patients/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, phone: newPhone })
      }).then(load);
    }
  };

  return e('div', { className: 'max-w-xl mx-auto space-y-4' }, [
    e('h1', { className: 'text-2xl font-bold' }, 'Patients'),
    e('div', { className: 'space-y-2' }, [
      e('input', {
        className: 'border p-2 w-full',
        placeholder: 'Name',
        value: name,
        onChange: e => setName(e.target.value)
      }),
      e('input', {
        className: 'border p-2 w-full',
        placeholder: 'Phone',
        value: phone,
        onChange: e => setPhone(e.target.value)
      }),
      e('button', {
        className: 'bg-blue-500 text-white px-4 py-2',
        onClick: addPatient
      }, 'Add')
    ]),
    e('ul', { className: 'space-y-2' }, patients.map(p =>
      e('li', { key: p.id, className: 'p-2 bg-white flex justify-between' }, [
        e('span', null, `${p.name}${p.phone ? ' (' + p.phone + ')' : ''}`),
        e('div', { className: 'space-x-2' }, [
          e('button', { className: 'text-blue-500', onClick: () => editPatient(p) }, 'Edit'),
          e('button', { className: 'text-red-500', onClick: () => deletePatient(p.id) }, 'Delete')
        ])
      ])
    ))
  ]);
}

ReactDOM.createRoot(document.getElementById('app')).render(e(PatientsPage));
