import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import IncidentForm from './IncidentForm';
import IncidentHistory from './IncidentHistory';
import StalkerRecord from './StalkerRecord';
import VictimProfile from './VictimProfile';
import PoliceSubmissionHistory from './PoliceSubmissionHistory';
import InstallationGuide from './InstallationGuide';
import CrimeHelp from './CrimeHelp';
import MotivationalVideo from './MotivationalVideo';
import type { PoliceDepartment } from '../types';

export default function MainContent() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [policeDepartment, setPoliceDepartment] = useState<PoliceDepartment | null>(null);
  const [activeTab, setActiveTab] = useState<string>('victim');
  
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const handleIncidentCreated = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
  };

  const handleReportMenuSelect = (value: string) => {
    setActiveTab(value);
  };

  return (
    <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Welcome message and motivational video - only for authenticated users */}
      {identity && userProfile && (
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
            Welcome back, {userProfile.name}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mb-4">
            Your safety, your evidence, your power.
          </p>
          
          {/* Motivational Video Button - Private Access Only */}
          <MotivationalVideo />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6 sm:mb-8 gap-0.5 sm:gap-1 h-auto p-1">
          <TabsTrigger 
            value="victim" 
            className="text-[10px] xs:text-xs sm:text-sm px-1.5 xs:px-2 sm:px-3 py-2 sm:py-2.5 leading-tight"
          >
            Your Info
          </TabsTrigger>
          <TabsTrigger 
            value="stalker" 
            className="text-[10px] xs:text-xs sm:text-sm px-1.5 xs:px-2 sm:px-3 py-2 sm:py-2.5 leading-tight"
          >
            Stalker Info
          </TabsTrigger>
          
          {/* Consolidated Report! Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-1.5 xs:px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] xs:text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 leading-tight ${
                  activeTab === 'report' || activeTab === 'history' || activeTab === 'evidence'
                    ? 'bg-background text-foreground shadow'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="truncate">Report!</span>
                <ChevronDown className="ml-0.5 xs:ml-1 h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-40 xs:w-44 sm:w-48">
              <DropdownMenuItem
                onSelect={() => handleReportMenuSelect('report')}
                className="cursor-pointer text-sm xs:text-base py-2.5 xs:py-3 px-3"
              >
                New Report
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleReportMenuSelect('history')}
                className="cursor-pointer text-sm xs:text-base py-2.5 xs:py-3 px-3"
              >
                History
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleReportMenuSelect('evidence')}
                className="cursor-pointer text-sm xs:text-base py-2.5 xs:py-3 px-3"
              >
                Evidence
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TabsTrigger 
            value="help" 
            className="text-[10px] xs:text-xs sm:text-sm px-1.5 xs:px-2 sm:px-3 py-2 sm:py-2.5 leading-tight"
          >
            Crime Help
          </TabsTrigger>
          <TabsTrigger 
            value="install" 
            className="text-[10px] xs:text-xs sm:text-sm px-1.5 xs:px-2 sm:px-3 py-2 sm:py-2.5 leading-tight"
          >
            Install Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="victim">
          <VictimProfile />
        </TabsContent>

        <TabsContent value="stalker">
          <StalkerRecord onPoliceDepartmentFound={setPoliceDepartment} />
        </TabsContent>

        <TabsContent value="report">
          <IncidentForm onIncidentCreated={handleIncidentCreated} />
        </TabsContent>

        <TabsContent value="history">
          <IncidentHistory 
            selectedIncidentId={selectedIncidentId}
            policeDepartment={policeDepartment}
          />
        </TabsContent>

        <TabsContent value="evidence">
          <PoliceSubmissionHistory />
        </TabsContent>

        <TabsContent value="help">
          <CrimeHelp />
        </TabsContent>

        <TabsContent value="install">
          <InstallationGuide />
        </TabsContent>
      </Tabs>
    </main>
  );
}
