const e = React.createElement;

function DoctorsPage() {
  const [doctors, setDoctors] = React.useState([]);
  const [name, setName] = React.useState('');
  const [specialty, setSpecialty] = React.useState('');

  const load = () => {
    fetch('http://localhost:8000/api/doctors')
      .then(res => res.json())
      .then(setDoctors);
  };

  React.useEffect(load, []);

  const addDoctor = () => {
    fetch('http://localhost:8000/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, specialty })
    }).then(() => { setName(''); setSpecialty(''); load(); });
  };

  const deleteDoctor = id => {
    fetch(`http://localhost:8000/api/doctors/${id}`, { method: 'DELETE' })
      .then(load);
  };

  const editDoctor = d => {
    const newName = prompt('Name', d.name);
    const newSpec = prompt('Specialty', d.specialty || '');
    if (newName !== null) {
      fetch(`http://localhost:8000/api/doctors/${d.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, specialty: newSpec })
      }).then(load);
    }
  };

  return e('div', { className: 'max-w-xl mx-auto space-y-4' }, [
    e('h1', { className: 'text-2xl font-bold' }, 'Doctors'),
    e('div', { className: 'space-y-2' }, [
      e('input', {
        className: 'border p-2 w-full',
        placeholder: 'Name',
        value: name,
        onChange: e => setName(e.target.value)
      }),
      e('input', {
        className: 'border p-2 w-full',
        placeholder: 'Specialty',
        value: specialty,
        onChange: e => setSpecialty(e.target.value)
      }),
      e('button', {
        className: 'bg-blue-500 text-white px-4 py-2',
        onClick: addDoctor
      }, 'Add')
    ]),
    e('ul', { className: 'space-y-2' }, doctors.map(d =>
      e('li', { key: d.id, className: 'p-2 bg-white flex justify-between' }, [
        e('span', null, `${d.name}${d.specialty ? ' (' + d.specialty + ')' : ''}`),
        e('div', { className: 'space-x-2' }, [
          e('button', { className: 'text-blue-500', onClick: () => editDoctor(d) }, 'Edit'),
          e('button', { className: 'text-red-500', onClick: () => deleteDoctor(d.id) }, 'Delete')
        ])
      ])
    ))
  ]);
}

ReactDOM.createRoot(document.getElementById('app')).render(e(DoctorsPage));
