import { motion } from 'motion/react';
import { Shield, Users, Target, Award } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';

export function About() {
  const { theme } = useTheme();

  const features = [
    { icon: Shield, title: 'Keamanan Terjamin', description: 'Sistem keamanan 24/7 dengan CCTV dan pos jaga untuk kenyamanan warga' },
    { icon: Users, title: 'Komunitas Solid', description: 'Warga yang kompak dan saling mendukung dalam berbagai kegiatan' },
    { icon: Target, title: 'Program Berkualitas', description: 'Berbagai program untuk pengembangan dan kesejahteraan warga' },
    { icon: Award, title: 'Prestasi Gemilang', description: 'Berbagai penghargaan tingkat kelurahan dan kecamatan' },
  ];

  const cardStyle = {
    background: `linear-gradient(135deg, ${theme.primary}18, ${theme.secondary}10)`,
    borderColor: `${theme.primary}35`,
    boxShadow: `0 0 40px ${theme.glowLight}`,
  };

  return (
    <section id="about" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full backdrop-blur-xl border"
            style={{ background: `${theme.primary}18`, borderColor: `${theme.primary}40` }}
          >
            <Users className="w-4 h-4" style={{ color: theme.primary }} />
            <span className="text-sm" style={{ color: theme.primary }}>Tentang Kami</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Tentang{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
            >
              RT 6 RW 1 Josjis
            </span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto mb-6">
            Platform digital modern yang menghubungkan warga RT 6 RW 1 dalam satu ekosistem komunitas yang terintegrasi
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative p-8 rounded-3xl backdrop-blur-xl border"
            style={cardStyle}
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-20 blur-3xl rounded-full"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">Visi Kami</h3>
              <p className="text-white/70 leading-relaxed">
                Menjadi komunitas RT 6 RW 1 yang modern, transparan, dan harmonis dengan memanfaatkan teknologi digital untuk meningkatkan kualitas hidup warga dan memperkuat tali persaudaraan antar tetangga.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative p-8 rounded-3xl backdrop-blur-xl border"
            style={cardStyle}
          >
            <div
              className="absolute top-0 left-0 w-40 h-40 opacity-20 blur-3xl rounded-full"
              style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})` }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">Misi Kami</h3>
              <ul className="space-y-3 text-white/70">
                {[
                  'Membangun komunikasi yang efektif antar warga',
                  'Meningkatkan partisipasi dalam kegiatan RT 6 RW 1',
                  'Memberikan layanan yang transparan dan akuntabel',
                  'Menciptakan lingkungan yang aman dan nyaman',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 font-bold" style={{ color: theme.primary }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
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
              className="relative p-6 rounded-3xl backdrop-blur-xl border overflow-hidden group"
              style={cardStyle}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity rounded-full"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
              />
              <div className="relative z-10">
                <div
                  className="inline-flex p-3 rounded-2xl mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    boxShadow: `0 0 20px ${theme.glowLight}`,
                  }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
