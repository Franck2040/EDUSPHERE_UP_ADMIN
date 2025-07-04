
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, BookOpen, Users, GraduationCap, Star, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      {/* Header with theme toggle */}
      <header className="absolute top-0 right-0 p-6 z-10">
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="text-center space-y-8 p-8 relative z-10 max-w-4xl mx-auto">
          {/* Logo/Icon */}
          <div className="animate-bounce-in">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Main heading */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
              Bienvenue sur EduSphere
            </h1>
          </div>
          
          {/* Subtitle */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Plateforme d'apprentissage collaborative pour les étudiants et professionnels. 
              Découvrez, apprenez et grandissez ensemble.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 btn-interactive group"
            >
              Commencer l'apprentissage
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              className="border-2 hover:bg-accent hover:scale-105 transition-all duration-300 btn-interactive glass-effect"
            >
              <Link to="/admin/login" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Administration
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">1000+</div>
              <div className="text-sm text-muted-foreground">Étudiants</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">500+</div>
              <div className="text-sm text-muted-foreground">Ressources</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">50+</div>
              <div className="text-sm text-muted-foreground">Ateliers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-8 bg-background/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Fonctionnalités principales
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez tout ce qu'EduSphere peut vous offrir pour votre parcours d'apprentissage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Bibliothèque de ressources",
                description: "Accédez à une vaste collection de livres et d'examens soigneusement sélectionnés",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: GraduationCap,
                title: "Ateliers interactifs",
                description: "Participez à des ateliers pratiques avec des environnements Docker intégrés",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Users,
                title: "Communauté active",
                description: "Échangez avec d'autres apprenants et partagez vos projets et expériences",
                color: "from-indigo-500 to-blue-500"
              }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="group card-hover animate-fade-in"
                style={{ animationDelay: `${1 + index * 0.2}s` }}
              >
                <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border/50 h-full hover-lift">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-12 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Ce que disent nos utilisateurs
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Marie Dubois",
                role: "Étudiante en informatique",
                content: "EduSphere a transformé ma façon d'apprendre. Les ateliers pratiques sont exceptionnels !",
                rating: 5
              },
              {
                name: "Pierre Martin",
                role: "Développeur junior",
                content: "Une plateforme complète avec une communauté formidable. Je recommande vivement !",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div 
                key={testimonial.name}
                className="animate-fade-in card-hover"
                style={{ animationDelay: `${1.4 + index * 0.2}s` }}
              >
                <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-border/50 hover-lift">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t bg-background/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in" style={{ animationDelay: '1.8s' }}>
            <p className="text-muted-foreground">
              © 2024 EduSphere. Tous droits réservés. Fait avec ❤️ pour l'éducation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
