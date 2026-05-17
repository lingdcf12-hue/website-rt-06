import { motion } from 'motion/react';
import { Shield, Users, Target, Award } from 'lucide-react';

export function About() {
  const features = [
    {
      icon: Shield,
      title: 'Keamanan Terjamin',
      description: 'Sistem keamanan 24/7 dengan CCTV dan pos jaga untuk kenyamanan warga',
      gradient: 'from-cyan-500 to-teal-500'
    },
    {
      icon: Users,
      title: 'Komunitas Solid',
      description: 'Warga yang kompak dan saling mendukung dalam berbagai kegiatan',
      gradient: 'from-teal-500 to-emerald-500'
    },
    {
      icon: Target,
      title: 'Program Berkualitas',
      description: 'Berbagai program untuk pengembangan dan kesejahteraan warga',
      gradient: 'from-emerald-500 to-cyan-500'
    },
    {
      icon: Award,
      title: 'Prestasi Gemilang',
      description: 'Berbagai penghargaan tingkat kelurahan dan kecamatan',
      gradient: 'from-cyan-500 to-emerald-500'
    }
  ];

  return (
    <section id="about" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-cyan-900/40 to-teal-900/40 backdrop-blur-xl border border-cyan-500/30">
            <Users className="w-4 h-4 text-cyan-300" />
            <span className="text-cyan-200 text-sm">Tentang Kami</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Tentang <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">RT 6 RW 1 Josjis</span>
          </h2>
          <p className="text-cyan-200/60 max-w-2xl mx-auto mb-6">
            Platform digital modern yang menghubungkan warga RT 6 RW 1 dalam satu ekosistem komunitas yang terintegrasi
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative p-8 rounded-3xl bg-gradient-to-br from-cyan-900/30 to-teal-900/20 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500 to-teal-500 opacity-20 blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">Visi Kami</h3>
              <p className="text-cyan-200/80 leading-relaxed">
                Menjadi komunitas RT 6 RW 1 yang modern, transparan, dan harmonis dengan memanfaatkan teknologi digital untuk meningkatkan kualitas hidup warga dan memperkuat tali persaudaraan antar tetangga.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative p-8 rounded-3xl bg-gradient-to-br from-cyan-900/30 to-teal-900/20 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]"
          >
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-teal-500 to-emerald-500 opacity-20 blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">Misi Kami</h3>
              <ul className="space-y-3 text-cyan-200/80">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Membangun komunikasi yang efektif antar warga</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Meningkatkan partisipasi dalam kegiatan RT 6 RW 1</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Memberikan layanan yang transparan dan akuntabel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Menciptakan lingkungan yang aman dan nyaman</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="relative p-6 rounded-3xl bg-gradient-to-br from-cyan-900/30 to-teal-900/20 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />

              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${feature.gradient} shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-cyan-200/70 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
