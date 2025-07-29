const e = React.createElement;

function App() {
  const [patients, setPatients] = React.useState([]);

  React.useEffect(() => {
    fetch('http://localhost:8000/api/patients')
      .then(res => res.json())
      .then(setPatients)
      .catch(err => console.error(err));
  }, []);

  return e('div', {className: 'max-w-xl mx-auto'}, [
    e('h1', {className: 'text-2xl font-bold mb-4'}, 'Patients'),
    e('ul', {className: 'space-y-2'}, patients.map(p =>
      e('li', {key: p.id, className: 'p-2 bg-white rounded shadow'}, p.name)
    ))
  ]);
}

ReactDOM.createRoot(document.getElementById('app')).render(e(App));
