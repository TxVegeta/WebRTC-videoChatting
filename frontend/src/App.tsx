import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Sender } from './components/Sender'
import { Receiver } from './components/Receiver'

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#1a2642] via-[#253a5e] to-[#2d4a7c] p-8 relative overflow-hidden">
      <div className="relative z-10 max-w-6xl w-full">
        <div className="text-center mb-20">
          <div className="inline-block mb-8">
            <div className="w-28 h-28 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-7xl font-bold text-white mb-6 tracking-tight">
            VidConnect
          </h1>
          <p className="text-blue-100 text-xl max-w-3xl mx-auto leading-relaxed">
            High-quality peer-to-peer video calling. Connect instantly with crystal clear audio and video.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          <Link
            to="/sender"
            className="group relative bg-[#2a3f5f]/40 backdrop-blur-md border-2 border-[#3a5a7f]/50 hover:border-[#4a6a8f]/80 rounded-3xl p-12 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-white mb-4">Start Call</h3>
              <p className="text-blue-200 text-lg leading-relaxed">Initiate a new video call and wait for someone to join</p>
            </div>
          </Link>

          <Link
            to="/receiver"
            className="group relative bg-[#2a3f5f]/40 backdrop-blur-md border-2 border-[#3a5a7f]/50 hover:border-[#4a6a8f]/80 rounded-3xl p-12 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-white mb-4">Join Call</h3>
              <p className="text-blue-200 text-lg leading-relaxed">Join an existing video call session</p>
            </div>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-[#2a3f5f]/30 backdrop-blur-sm border-2 border-[#3a5a7f]/40 rounded-2xl p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Instant Connection</h4>
            <p className="text-blue-200 text-base leading-relaxed">Connect immediately with our optimized WebRTC technology</p>
          </div>

          <div className="bg-[#2a3f5f]/30 backdrop-blur-sm border-2 border-[#3a5a7f]/40 rounded-2xl p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">HD Quality</h4>
            <p className="text-blue-200 text-base leading-relaxed">Crystal clear video and audio for the best calling experience</p>
          </div>

          <div className="bg-[#2a3f5f]/30 backdrop-blur-sm border-2 border-[#3a5a7f]/40 rounded-2xl p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-600 rounded-2xl mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Peer-to-Peer</h4>
            <p className="text-blue-200 text-base leading-relaxed">Direct connection ensures privacy and low latency</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sender" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
