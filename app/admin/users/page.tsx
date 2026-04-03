"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Must match enum in C# backend
enum UserStatus {
  PendingEmailVerification = 0,
  PendingApproval = 1,
  Active = 2,
  Denied = 3,
  Blocked = 4,
}

const statusTextMap: Record<UserStatus, string> = {
  [UserStatus.PendingEmailVerification]: "Pending Verification",
  [UserStatus.PendingApproval]: "Pending Approval",
  [UserStatus.Active]: "Active",
  [UserStatus.Denied]: "Denied",
  [UserStatus.Blocked]: "Blocked",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchApi("/users");
      setUsers(data);
    } catch (err: any) {
      if (err.message && err.message.includes("401")) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await fetchApi(`/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: parseInt(newStatus) }),
      });
      // Refresh local state to reflect change instantly
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: parseInt(newStatus) } : u))
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading users...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage user accounts and system access.</p>
        </div>
        <Button variant="outline" onClick={logout}>Sign Out</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>View all users and modify their account status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.roles?.map((r: string) => (
                          <Badge key={r} variant="secondary" className="text-xs">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                         variant={
                           user.status === UserStatus.Active ? "default" :
                           user.status === UserStatus.Blocked || user.status === UserStatus.Denied ? "destructive" :
                           "outline"
                         }
                      >
                        {statusTextMap[user.status as UserStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        defaultValue={user.status.toString()}
                        onValueChange={(val) => handleStatusChange(user.id, val)}
                      >
                        <SelectTrigger className="w-[160px] ml-auto">
                          <SelectValue placeholder="Change status..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UserStatus.PendingEmailVerification.toString()}>
                            Require Email Auth
                          </SelectItem>
                          <SelectItem value={UserStatus.PendingApproval.toString()}>
                            Wait for Approval
                          </SelectItem>
                          <SelectItem value={UserStatus.Active.toString()}>
                            Activate
                          </SelectItem>
                          <SelectItem value={UserStatus.Denied.toString()}>
                            Deny
                          </SelectItem>
                          <SelectItem value={UserStatus.Blocked.toString()}>
                            Block
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
