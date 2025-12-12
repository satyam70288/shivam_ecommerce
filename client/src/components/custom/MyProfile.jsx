import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";

export default function MyProfile() {
  return (
    <div className="w-full bg-muted/30 dark:bg-muted/20 transition-colors">
      <Card
        className="
          mx-auto w-full
          max-w-xl sm:max-w-2xl md:max-w-3xl
          rounded-2xl shadow-sm
          bg-card text-card-foreground
          px-4 sm:px-6 md:px-10
          py-6 sm:py-8 md:py-12
          transition-colors
        "
      >
        {/* HEADER */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Account
          </h1>
          <p className="text-sm text-muted-foreground max-w-md">
            Manage your personal information and keep your account secure.
          </p>
        </div>

        <Separator className="my-6 sm:my-8 md:my-10" />

        {/* PERSONAL INFO */}
        <section className="space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-base sm:text-lg font-medium">
              Personal details
            </h2>
            <p className="text-sm text-muted-foreground">
              This information will be used for orders and communication.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
            <div className="space-y-2">
              <Label className="text-sm">Full name</Label>
              <Input
                className="h-10 sm:h-11 bg-background"
                defaultValue="Satyam Bharti"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Email address</Label>
              <Input
                className="h-10 sm:h-11 bg-muted/50 dark:bg-muted/30"
                defaultValue="satyamb971@gmail.com"
                disabled
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm">Mobile number</Label>
              <div className="flex gap-3 max-w-sm">
                <Button
                  variant="outline"
                  className="
                    h-10 sm:h-11 px-3 rounded-lg shrink-0
                    bg-background dark:bg-muted/30
                  "
                >
                  🇮🇳 <ChevronDown size={14} />
                </Button>
                <Input
                  className="h-10 sm:h-11 bg-background"
                  placeholder="Enter your mobile number"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              className="
                w-full sm:w-auto
                px-8
                h-10 sm:h-11
                rounded-full
              "
            >
              Save changes
            </Button>
          </div>
        </section>

        <Separator className="my-10 sm:my-12 md:my-14" />

        {/* SECURITY */}
        <section className="space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-base sm:text-lg font-medium">Security</h2>
            <p className="text-sm text-muted-foreground">
              Change your password to protect your account.
            </p>
          </div>

          <div className="max-w-sm space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label className="text-sm">Current password</Label>
              <Input className="h-10 sm:h-11 bg-background" type="password" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">New password</Label>
              <Input className="h-10 sm:h-11 bg-background" type="password" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Confirm new password</Label>
              <Input className="h-10 sm:h-11 bg-background" type="password" />
            </div>

            <Button
              variant="outline"
              className="
                w-full sm:w-auto
                h-10 sm:h-11
                rounded-full
                px-6
              "
            >
              Update password
            </Button>
          </div>
        </section>
      </Card>
    </div>
  );
}
