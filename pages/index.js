import { useState } from "react";

export default function Home() {
  const [teamA, setTeamA] = useState(0);
  const [teamB, setTeamB] = useState(0);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>🔥 QTIME</h1>

      <h2>النقاط</h2>

      <div style={{ marginBottom: 20 }}>
        <h3>الفريق الأول: {teamA}</h3>
        <button onClick={() => setTeamA(teamA + 200)}>+200</button>
      </div>

      <div>
        <h3>الفريق الثاني: {teamB}</h3>
        <button onClick={() => setTeamB(teamB + 200)}>+200</button>
      </div>
    </div>
  );
}
