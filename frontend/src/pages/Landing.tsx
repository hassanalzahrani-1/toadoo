import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Trophy, Users, Zap, Target, TrendingUp } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🐸</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">Toadoo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center border-b">
        <div className="max-w-3xl mx-auto">
          <div className="text-6xl mb-6">🐸</div>
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Hop Into Productivity
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gamified todo management that makes completing tasks fun and rewarding. 
            Compete with friends, earn ranks, and watch your productivity grow!
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8">
                Start Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Free forever
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 border-b">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Toadoo?</h2>
          <p className="text-muted-foreground">Everything you need to stay organized and motivated</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Kanban Board</CardTitle>
              <CardDescription>
                Drag-and-drop interface with three columns: Pending, In Progress, and Completed
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Ranking System</CardTitle>
              <CardDescription>
                Earn ranks from 🌱 Seedling to 🏆 Legend based on completed tasks
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Leaderboards</CardTitle>
              <CardDescription>
                Compete with others on all-time, monthly, and weekly leaderboards
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Harvest System</CardTitle>
              <CardDescription>
                Complete and harvest tasks to earn permanent progress and climb ranks
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Priority Levels</CardTitle>
              <CardDescription>
                Organize tasks by priority (Low, Medium, High) and due dates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Visual progress bars show how close you are to your next rank
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 border-b">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Tasks</h3>
              <p className="text-muted-foreground">
                Add your todos with titles, descriptions, priorities, and due dates
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete & Harvest</h3>
              <p className="text-muted-foreground">
                Move tasks through your board and harvest completed ones for points
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Climb the Ranks</h3>
              <p className="text-muted-foreground">
                Earn ranks, compete on leaderboards, and become a productivity legend
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Leap Into Action?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who are making productivity fun with Toadoo
          </p>
          <Link to="/register">
            <Button size="lg" className="text-lg px-12">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐸</span>
              <span className="font-semibold text-green-600 dark:text-green-400">Toadoo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Toadoo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
