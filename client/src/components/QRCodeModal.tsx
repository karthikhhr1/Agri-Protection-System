import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Smartphone } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface QRCodeModalProps {
  testId?: string;
}

export function QRCodeModal({ testId = "button-qr-code" }: QRCodeModalProps) {
  const { t } = useLanguage();
  
  const appUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://agriguard.replit.app';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" data-testid={testId}>
          <QrCode className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            {t('qr.title')}
          </DialogTitle>
          <DialogDescription>
            {t('qr.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="p-4 bg-white rounded-lg shadow-lg">
            <QRCodeSVG
              value={appUrl}
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#1a472a"
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('qr.scanInstructions')}
            </p>
            <p className="text-xs text-muted-foreground/70 break-all max-w-[280px]">
              {appUrl}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
