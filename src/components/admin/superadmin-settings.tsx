import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const SuperAdminSettings = () => {
  return <Tabs defaultValue="account" className="grid grid-cols-4 gap-4 h-full py-4  grid-flow-row auto-rows-min">
    <TabsList className="flex flex-col gap-4 p-2  h-fit col-span-4 md:col-span-1">
      <TabsTrigger value="account" className="w-full">Account</TabsTrigger>
      <TabsTrigger value="password" className="w-full">Password</TabsTrigger>
      <TabsTrigger value="team" className="w-full">Team</TabsTrigger>
    </TabsList>
    <TabsContent className="col-span-4 md:col-span-3" value="account">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Adjust settings related to your account or profile.</CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </TabsContent>
    <TabsContent className="col-span-4 md:col-span-3" value="password">
      <Card>
        <CardHeader>
          <CardTitle>Password Settings</CardTitle>
          <CardDescription>Change your account password.</CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </TabsContent>
    <TabsContent className="col-span-4 md:col-span-3" value="team">
      <Card>
        <CardHeader>
          <CardTitle>Team Settings</CardTitle>
          <CardDescription>Manage your team members and access.</CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </TabsContent>
  </Tabs>
}

export default SuperAdminSettings