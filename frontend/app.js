const e = React.createElement;

function useFetchList(url) {
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setItems)
      .catch(err => console.error(err));
  }, [url]);

  return [items, setItems];
}

function PatientManager() {
  const [patients, setPatients] = useFetchList('http://localhost:8000/api/patients');
  const [name, setName] = React.useState('');

  const addPatient = e => {
    e.preventDefault();
    fetch('http://localhost:8000/api/patients', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name})
    })
      .then(res => res.json())
      .then(p => {
        setPatients(patients.concat(p));
        setName('');
      })
      .catch(err => console.error(err));
  };

  return e('div', null, [
    e('h1', {className: 'text-2xl font-bold mb-4'}, 'Patients'),
    e('form', {onSubmit: addPatient, className: 'mb-4'}, [
      e('input', {
        value: name,
        onChange: evt => setName(evt.target.value),
        className: 'border p-2 mr-2',
        placeholder: 'New patient name'
      }),
      e('button', {type: 'submit', className: 'bg-blue-500 text-white p-2'}, 'Add')
    ]),
    e('ul', {className: 'space-y-2'}, patients.map(p =>
      e('li', {key: p.id, className: 'p-2 bg-white rounded shadow'}, p.name)
    ))
  ]);
}

function DoctorManager() {
  const [doctors, setDoctors] = useFetchList('http://localhost:8000/api/doctors');
  const [name, setName] = React.useState('');

  const addDoctor = e => {
    e.preventDefault();
    fetch('http://localhost:8000/api/doctors', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name})
    })
      .then(res => res.json())
      .then(d => {
        setDoctors(doctors.concat(d));
        setName('');
      })
      .catch(err => console.error(err));
  };

  return e('div', null, [
    e('h1', {className: 'text-2xl font-bold mb-4'}, 'Doctors'),
    e('form', {onSubmit: addDoctor, className: 'mb-4'}, [
      e('input', {
        value: name,
        onChange: evt => setName(evt.target.value),
        className: 'border p-2 mr-2',
        placeholder: 'New doctor name'
      }),
      e('button', {type: 'submit', className: 'bg-blue-500 text-white p-2'}, 'Add')
    ]),
    e('ul', {className: 'space-y-2'}, doctors.map(d =>
      e('li', {key: d.id, className: 'p-2 bg-white rounded shadow'}, d.name)
    ))
  ]);
}

function App() {
  const [view, setView] = React.useState('patients');

  return e('div', {className: 'max-w-xl mx-auto'}, [
    e('nav', {className: 'mb-4 space-x-2'}, [
      e('button', {
        onClick: () => setView('patients'),
        className: view === 'patients' ? 'font-bold underline p-2' : 'p-2'
      }, 'Patients'),
      e('button', {
        onClick: () => setView('doctors'),
        className: view === 'doctors' ? 'font-bold underline p-2' : 'p-2'
      }, 'Doctors')
    ]),
    view === 'patients' ? e(PatientManager) : e(DoctorManager)
  ]);
}

ReactDOM.createRoot(document.getElementById('app')).render(e(App));
