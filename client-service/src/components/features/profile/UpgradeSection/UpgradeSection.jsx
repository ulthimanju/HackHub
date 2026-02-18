import React, { memo } from 'react';
import { ShieldAlert, Key, Send } from 'lucide-react';
import Input from '../../../common/Input/Input';
import Button from '../../../common/Button/Button';
import Section from '../../../common/Section/Section';

const UpgradeSection = memo(({ 
  showOtpInput, 
  otp, 
  onOtpChange, 
  onRequestOtp, 
  onUpgrade, 
  otpLoading, 
  loading 
}) => {
  return (
    <Section title="Account Upgrade">
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 space-y-6 transition-all hover:bg-orange-50/80">
        <div className="flex gap-5">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-600 shrink-0 shadow-sm border border-orange-100">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-orange-900 tracking-tight">Become an Organizer</h4>
            <p className="text-orange-800/80 text-sm mt-1 leading-relaxed font-medium">
              Host your own hackathons, manage teams, and evaluate submissions. 
              Requires a quick email verification to verify your identity.
            </p>
          </div>
        </div>

        <form onSubmit={onUpgrade} className="space-y-4 pt-4 border-t border-orange-200/40">
          {!showOtpInput ? (
            <Button 
              type="button" 
              variant="primary" 
              onClick={onRequestOtp}
              loading={otpLoading}
              icon={Send}
              className="w-full py-4 rounded-xl shadow-lg shadow-orange-200/50 hover:shadow-orange-300/50"
            >
              Request Upgrade OTP
            </Button>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-top-2 fade-in">
              <div className="flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full">
                  <Input
                    label="Verification Code"
                    icon={Key}
                    value={otp}
                    onChange={(e) => onOtpChange(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="rounded-xl"
                    autoFocus
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onRequestOtp}
                  loading={otpLoading}
                  className="w-full sm:w-auto h-[46px] mb-1 px-6 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  Resend
                </Button>
              </div>
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full py-4 rounded-xl shadow-lg shadow-orange-200/50"
                loading={loading}
              >
                Confirm & Upgrade Account
              </Button>
            </div>
          )}
        </form>
      </div>
    </Section>
  );
});
UpgradeSection.displayName = 'UpgradeSection';
export default UpgradeSection;
