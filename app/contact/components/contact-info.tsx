import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function ContactInfo() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Our Location</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Map iframe */}
          <div className="aspect-square w-full overflow-hidden rounded-md mb-6">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.292292615509614!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sEiffel%20Tower!5e0!3m2!1sen!2sfr!4v1631451076910!5m2!1sen!2sfr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Address</h3>
                <p className="text-sm text-muted-foreground">
                  123 Commerce Street
                  <br />
                  Business District
                  <br />
                  Paris, 75000
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Phone</h3>
                <p className="text-sm text-muted-foreground">
                  +33 (0)1 23 45 67 89
                  <br />
                  +33 (0)9 87 65 43 21
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-sm text-muted-foreground">
                  contact@crossguild.com
                  <br />
                  support@crossguild.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Business Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday: 9am - 6pm
                  <br />
                  Saturday: 10am - 4pm
                  <br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <a
              href="#"
              className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <Facebook className="h-5 w-5 text-primary" />
            </a>
            <a
              href="#"
              className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <Instagram className="h-5 w-5 text-primary" />
            </a>
            <a
              href="#"
              className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <Twitter className="h-5 w-5 text-primary" />
            </a>
            <a
              href="#"
              className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <Linkedin className="h-5 w-5 text-primary" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
