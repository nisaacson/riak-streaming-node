# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  ####################################
  # Networking
  ####################################
  config.vm.define "riaks" do |develop|
    develop.vm.host_name = "riaks"
    develop.vm.network "forwarded_port", guest: 8087, host: 8087 # riak pbc
    develop.vm.network "forwarded_port", guest: 8098, host: 8098 # riak http
  end
  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  config.vm.network :private_network, ip: "192.168.33.10"

  ####################################
  # Provisioning
  ####################################

  # docker provisioner
  config.vm.provision "docker" do |docker|
    docker.pull_images "nisaacson/riak"
    docker.run "nisaacson/riak",
      args: "-p 3333:22 -p 8087:8087 -p 8098:8098"
  end

  # shell provisioner
  config.vm.provision "shell", path: "test/provision_vagrant.sh"


  ####################################
  # Provider specific configuration
  ####################################
  config.vm.provider :virtualbox do |vb, override|
    # Do boot with headless mode
    vb.gui = false
    vb.vm.box = "precise64_virtualbox"
    vb.vm.box_url = "http://files.vagrantup.com/precise64.box"
    override.vm.box = "precise64_vmware"
    override.vm.box_url = 'http://files.vagrantup.com/precise64_vmware.box'

    # Use VBoxManage to customize the VM. For example to change memory:
    vb.customize ["modifyvm", :id, "--memory", "5012"]
    vb.customize ["modifyvm", :id, "--cpus", "3"]
  end


  # override box and box_url when using the "--provider vmware_fusion" flag
  config.vm.provider "vmware_fusion" do |v, override|
    override.vm.box = "precise64_fusion"
    override.vm.box_url = "http://files.vagrantup.com/precise64_vmware.box"
    v.gui = false
    v.vmx["memsize"] = "5012"
    v.vmx["numvcpus"] = "3"
  end

end
