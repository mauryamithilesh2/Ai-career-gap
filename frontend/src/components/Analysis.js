import React, { useState } from "react";

function Analysis() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!resumeText || !jobText) {
      setError("Please fill both fields before analyzing.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const BASE_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${BASE_URL}/api/analyze/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ resume_text: resumeText, job_text: jobText }),
      });

      if (!response.ok) throw new Error("Unauthorized or failed request.");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 text-gray-900">
      <h2 className="text-3xl font-bold text-center mb-6">Resume & Job Analysis</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Resume Input */}
        <div>
          <h3 className="font-semibold mb-2">Resume Text</h3>
          <textarea
            className="w-full h-48 p-3 border rounded-md focus:outline-blue-500"
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>

        {/* Job Description Input */}
        <div>
          <h3 className="font-semibold mb-2">Job Description</h3>
          <textarea
            className="w-full h-48 p-3 border rounded-md focus:outline-blue-500"
            placeholder="Paste job description here..."
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
          />
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {error && (
        <div className="mt-4 text-center text-red-500 font-semibold">
          {error}
        </div>
      )}

      {/* Result Section */}
      {result && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-blue-600 mb-4 text-center">Analysis Result</h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Skills Section */}
            <div>
              <h4 className="text-lg font-semibold mb-2">Resume Skills</h4>
              <ul className="list-disc ml-6 text-gray-700">
                {result.resume_skills?.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>

              <h4 className="text-lg font-semibold mt-4 mb-2">Job Skills</h4>
              <ul className="list-disc ml-6 text-gray-700">
                {result.job_skills?.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>

              <h4 className="text-lg font-semibold mt-4 mb-2">Missing Skills</h4>
              {result.missing_skills?.length > 0 ? (
                <ul className="list-disc ml-6 text-red-600">
                  {result.missing_skills.map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600">No missing skills 🎯</p>
              )}
            </div>

            {/* Summary Section */}
            <div>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="text-lg font-semibold mb-2">Match Percentage</h4>
                <div className="text-3xl font-bold text-blue-600">
                  {result.match_percent}%
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-lg font-semibold mb-2">Recommendations</h4>
                <ul className="list-disc ml-6 text-gray-700">
                  {result.recommendations?.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-2">Resume Overview</h4>
                <p>Experience: {result.resume_overview?.has_experirnce ? "✅ Yes" : "❌ No"}</p>
                <p>Education: {result.resume_overview?.has_education ? "✅ Yes" : "❌ No"}</p>
                <p>Years of Experience: {result.resume_overview?.year_experience}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analysis;
