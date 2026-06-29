export interface TeamMember {
  name: string;
  title: string;
  bio?: string;
  image?: string;
}

interface TeamGridProps {
  members?: TeamMember[];
  columns?: 3 | 4;
  heading?: string;
}

const defaultMembers: TeamMember[] = [
  {
    name: "Dr. Patricia Hernandez",
    title: "Medical Director",
    bio: "Board-certified geriatrician with 20+ years of experience in senior care. Leads our clinical programs and quality assurance.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
  },
  {
    name: "James Whitfield",
    title: "Executive Director",
    bio: "Former hospital administrator passionate about creating communities where seniors thrive. Oversees all operations and resident experience.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
  },
  {
    name: "Angela Moretti",
    title: "Director of Nursing",
    bio: "Registered nurse with expertise in memory care and chronic condition management. Ensures every resident receives compassionate, personalized care.",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80",
  },
  {
    name: "David Kim",
    title: "Life Enrichment Director",
    bio: "Certified therapeutic recreation specialist who designs 200+ monthly activities promoting wellness, creativity, and social connection.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
];

export function TeamGrid({
  members = defaultMembers,
  columns = 4,
  heading = "Meet Our Leadership Team",
}: TeamGridProps) {
  const gridCols = columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="bg-background py-16 lg:py-24" data-nocms-component="content/team-grid">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text text-center mb-12" data-role="heading">
          {heading}
        </h2>
        <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
          {(members ?? []).map((member) => (
            <div
              key={member.name}
              className="group text-center"
            >
              <div className="relative mx-auto w-48 h-48 mb-5 rounded-xl overflow-hidden shadow-md">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy" data-role="media"
                  />
                ) : (
                  <div className="w-full h-full bg-surface flex items-center justify-center">
                    <span className="text-4xl font-heading font-bold text-primary/30">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-heading text-lg font-bold text-text">{member.name}</h3>
              <p className="text-primary text-sm font-medium mb-2">{member.title}</p>
              {member.bio && (
                <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto" data-role="subheading">
                  {member.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
