import React from 'react'
import Navbar from '../components_lite/Navbar'
import nilesh from './nilesh.png'
import omkarSankapal from './omkar_sankapal.png'
import omkarMohite from './omkar_mohite.png'
import rahulDongare from './rahul_dongare.png'

const TEAM_PHOTO_CLASS =
  'mx-auto h-80 w-64 shrink-0 rounded-lg bg-gray-100 object-cover object-[center_15%] shadow-md'

const TeamPhoto = ({ src, alt }) => (
  <img src={src} alt={alt} className={TEAM_PHOTO_CLASS} />
)

const Creator = () => {
  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full">
          <div className="flex justify-center">
            <img
              src={nilesh}
              alt="Nilesh Singh"
              className="h-80 max-w-sm w-auto object-contain rounded-lg shadow-md"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nilesh Singh</h2>
            <p className="text-gray-600 mb-2">
              Nilesh Singh completed his{' '}
              <strong>B.Tech in Computer Science and Engineering (CSE)</strong> from{' '}
              <strong>Sunrise Institute of Technology, Jaipur</strong>, in <strong>2005</strong>.
            </p>
            <p className="text-gray-600 mb-2">
              After completing his graduation, he worked as a <strong>Software Developer</strong> at a
              private IT company in <strong>Pune</strong> for two years. Later, he pursued his{' '}
              <strong>M.Tech in Information Technology</strong> from{' '}
              <strong>National Institute of Technology (NIT), Patna</strong>.
            </p>
            <p className="text-gray-600 mb-2">
              Following his post-graduation, he joined{' '}
              <strong>Global Engineering College, Lucknow</strong>, as an{' '}
              <strong>Assistant Professor</strong> in the <strong>Computer Science Department</strong>.
              During his academic career, he actively participated in various research projects
              related to <strong>Artificial Intelligence</strong> and <strong>Cloud Computing</strong>.
            </p>
            <p className="text-gray-600 mb-2">
              In <strong>2018</strong>, he completed his{' '}
              <strong>Ph.D. in Computer Science and Engineering</strong> from{' '}
              <strong>Dr. A.P.J. Abdul Kalam Technical University, Lucknow</strong>.
            </p>
            <p className="text-gray-600">
              Currently, he is serving as an <strong>Associate Professor</strong> in the{' '}
              <strong>Department of Computer Science and Engineering</strong> at{' '}
              <strong>Apex Institute of Technology, Bhopal</strong>, where he continues to teach and
              guide students in emerging technologies and software development.
            </p>
          </div>
        </div>
      </div>

      <hr className="w-full border-gray-300 my-6" />

      <div className="text-center p-6 pb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Developers and Designers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <TeamPhoto src={omkarSankapal} alt="Omkar Sankapal" />
            <h3 className="text-lg font-semibold text-gray-700 mt-2">Omkar Sankapal</h3>
            <p className="text-gray-600 text-sm">Registration No: 21110125035</p>
            <p className="text-gray-600 text-sm">Full Stack Developer</p>
          </div>
          <div className="text-center">
            <TeamPhoto src={omkarMohite} alt="Omkar Mohite" />
            <h3 className="text-lg font-semibold text-gray-700 mt-2">Omkar Mohite</h3>
            <p className="text-gray-600 text-sm">Registration No: 21110125043</p>
            <p className="text-gray-600 text-sm">UI/UX Designer</p>
          </div>
          <div className="text-center">
            <TeamPhoto src={rahulDongare} alt="Rahul Dongare" />
            <h3 className="text-lg font-semibold text-gray-700 mt-2">Rahul Dongare</h3>
            <p className="text-gray-600 text-sm">Registration No: 21110125023</p>
            <p className="text-gray-600 text-sm">Research</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Creator
