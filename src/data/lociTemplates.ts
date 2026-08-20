export interface LocusTemplate {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

export interface PalaceTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  loci: LocusTemplate[];
}

export const LOCI_TEMPLATES: PalaceTemplate[] = [
  {
    id: "clinic",
    title: "Medical Clinic",
    description: "Ideal for pharmacology & anatomy. Layout follows a patient consultation sequence.",
    icon: "🏥",
    loci: [
      {
        id: "clinic-1",
        name: "Waiting Room Bench",
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
        description: "The reception area waiting bench where patients check in."
      },
      {
        id: "clinic-2",
        name: "Consultation Desk",
        imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
        description: "The doctor's wooden desk with a computer and patient charts."
      },
      {
        id: "clinic-3",
        name: "Patient Exam Chair",
        imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
        description: "The adjustable examination chair in the center of the room."
      },
      {
        id: "clinic-4",
        name: "Instrument Cabinet",
        imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
        description: "The glass-doored metal cabinet containing clinical instruments."
      },
      {
        id: "clinic-5",
        name: "Stethoscope Tray",
        imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=800&q=80",
        description: "The stainless steel tray holding diagnostic supplies and stethoscopes."
      }
    ]
  },
  {
    id: "library",
    title: "Classic Library",
    description: "Great for heavy historical terms, biochemistry pathways, and structural classifications.",
    icon: "📚",
    loci: [
      {
        id: "library-1",
        name: "Reception Counter",
        imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
        description: "The main checkout counter with books stacked high."
      },
      {
        id: "library-2",
        name: "Reading Table Lamp",
        imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
        description: "A green-shaded brass reading lamp on a long oak table."
      },
      {
        id: "library-3",
        name: "Main Bookshelf Aisle",
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
        description: "A towering aisle of dusty textbooks and research archives."
      },
      {
        id: "library-4",
        name: "Study Alcove",
        imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
        description: "A cozy windowed cubicle with a single desk chair."
      },
      {
        id: "library-5",
        name: "Spiral Staircase",
        imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
        description: "An ornate iron spiral staircase leading up to the upper mezzanine."
      }
    ]
  },
  {
    id: "living-room",
    title: "Modern Living Room",
    description: "Highly intuitive layout utilizing household landmarks you are familiar with.",
    icon: "🛋️",
    loci: [
      {
        id: "living-1",
        name: "Plush Sofa",
        imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
        description: "The large gray fabric sectional sofa in the center."
      },
      {
        id: "living-2",
        name: "Fireplace Mantle",
        imageUrl: "https://images.unsplash.com/photo-1577156223412-7060ef55b218?auto=format&fit=crop&w=800&q=80",
        description: "The marble fireplace mantle decorated with candles and frames."
      },
      {
        id: "living-3",
        name: "Coffee Table",
        imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80",
        description: "The low-profile wooden table sitting on the central rug."
      },
      {
        id: "living-4",
        name: "Armchair Corner",
        imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
        description: "A comfortable leather accent chair under a reading lamp."
      },
      {
        id: "living-5",
        name: "Large Bay Window",
        imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
        description: "A wide glass bay window overlooking the outside garden."
      }
    ]
  },
  {
    id: "classroom",
    title: "Quiet Classroom",
    description: "Excellent for structured learning topics, anatomy slides, or procedural sequences.",
    icon: "🏫",
    loci: [
      {
        id: "classroom-1",
        name: "Teacher's Whiteboard",
        imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
        description: "The main magnetic whiteboard at the front of the room."
      },
      {
        id: "classroom-2",
        name: "Lecture Podium",
        imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
        description: "The speaker's stand facing the student desks."
      },
      {
        id: "classroom-3",
        name: "Front Row Desk",
        imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80",
        description: "The central wooden study desks in the first row."
      },
      {
        id: "classroom-4",
        name: "Anatomy Wall Chart",
        imageUrl: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=800&q=80",
        description: "The detailed anatomical chart hanging on the side wall."
      },
      {
        id: "classroom-5",
        name: "Microscope Lab Bench",
        imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80",
        description: "The black stone lab counter equipped with a microscope and slides."
      }
    ]
  }
];
