#!/bin/perl -w
use strict;

my %macros;
my @macro_order = ();

## READ INPUT

my $state = "IDLE"; # VALUES = IDLE, RECORDING
my $rec_macro_name = "";
my $rec_macro_text = "";

my $next_state = "IDLE";
while (my $line = <>) {
  #print $line;
  $line =~ s/\r\n\z//;
  chomp($line);
  if    ($state eq "IDLE")      {
    if   ($line =~ /^---+$/) { $next_state = "IDLE"; }
    else                     { #print "      IDLE -> RECORDING\n";
                               $next_state = "RECORDING";
                               $rec_macro_name = $line;
                               $rec_macro_text = ""; };
  }
  elsif ($state eq "RECORDING") {
    if   ($line =~ /^---+$/) { #print "      RECORDING -> IDLE\n";
                               $next_state = "IDLE";
                               $macros{$rec_macro_name} = $rec_macro_text;
                               push @macro_order, $rec_macro_name;
                               $rec_macro_name = "";
                               $rec_macro_text = ""; }
    else                     { $rec_macro_text .= (($rec_macro_text eq "")?(""):"\n") . $line };
  }
  else                          {
    #print "ERROR: invalid state";
    exit 1;
  };
  $state = $next_state;
};
if ($state eq "RECORDING") {
  $macros{$rec_macro_name} = $rec_macro_text;
  push @macro_order, $rec_macro_name;
  $rec_macro_name = "";
  $rec_macro_text = "";
};
#print "\n### PARSING COMPLETE\n\n";

## ESCAPE MACROS

my %escaped_macros;

foreach my $name ( @macro_order ) {
  #print $name . "\n";
  my $macro = $macros{$name};
  $macro =~ s/^ +//;
  $macro =~ s/ +$//;
  my $escaped = "";
  my $at_beginning_of_line = 0;
  my $in_an_attribute_ref = "";
  for my $i (0..length($macro)-1) {
    my $input_char = substr($macro, $i, 1);
    my $append_chars = $input_char;
    if    ($input_char eq "\n") { $at_beginning_of_line = 1; }
    elsif ($input_char ne " " ) { $at_beginning_of_line = 0; };
    if    (($input_char eq " ") and ($at_beginning_of_line))      { $append_chars = "&nbsp;"  }
    elsif (($input_char eq "|") and ($in_an_attribute_ref eq "")) { $append_chars = "&#124;"; }
    elsif (($input_char eq ",") and ($in_an_attribute_ref eq "")) { $append_chars = "&#44;";  }
    elsif (($input_char eq "}") and ($in_an_attribute_ref eq "")) { $append_chars = "&#125;"; }
    elsif ($input_char eq "\@")                                      { $in_an_attribute_ref = "\@";  }
    elsif (($input_char eq "{") and ($in_an_attribute_ref eq "\@" )) { $in_an_attribute_ref = "\@{"; }
    elsif (($input_char eq "}") and ($in_an_attribute_ref eq "\@{")) { $in_an_attribute_ref = "";    }
    else { };
    $escaped .= $append_chars;
  };
  #$escaped =~ s/`/&grave;/g;
  #$escaped =~ s/\)/&#41;/g;
  #$escaped =~ s/}}/}&#125;/g;
  #$escaped =~ s/]]/]&#93;/g;
  #$escaped =~ s/\*/&#42;/g;
  #$escaped =~ s/\?\{/&#63;{/g;
  #$escaped =~ s/^\@/&#64;/;
  #$escaped =~ s/\\n/\n/g;
  $escaped_macros{$name} = $escaped;
  #print $escaped . "\n\n";
};

#PRINT
print '?{Skills|';
my $first = 1;
foreach my $name ( @macro_order) {
  if (not $first) { print "|"; }
  print $name.",".$escaped_macros{$name};
  $first = 0;
};
print "}";

exit;

my %buttons;
